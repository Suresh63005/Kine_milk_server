const Product = require("../Models/Product");
const { Op } = require("sequelize");
const asyncHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const uploadToS3 = require("../config/fileUpload.aws");
const Store = require("../Models/Store");
const WeightOption = require("../Models/WeightOption")
const ProductImage = require("../Models/productImages");
const ProductInvetory = require("../Models/ProductInventory")
const StoreWeightOption = require("../Models/StoreWeightOption")

const upsertProduct = async (req, res) => {
  try {
    const {
      id,
      title,
      status,
      cat_id,
      description,
      out_of_stock,
      subscription_required,
      weightOptions,
      discount,
      batch_number
    } = req.body;

    console.log("Request body:", req.body);

    // Validate required fields
    if (
      !title ||
      !status ||
      !cat_id ||
      !description ||
      !out_of_stock ||
      !subscription_required ||
      !weightOptions
    ) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "All fields are required.",
      });
    }

    // Parse weightOptions (since it's sent as a JSON string)
    let parsedWeightOptions;
    try {
      parsedWeightOptions = JSON.parse(weightOptions);
    } catch (error) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Invalid weightOptions format. Must be a valid JSON string.",
      });
    }

    // Validate weightOptions
    if (!Array.isArray(parsedWeightOptions) || parsedWeightOptions.length === 0) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "At least one weight option is required.",
      });
    }

    for (const option of parsedWeightOptions) {
      if (
        !option.weight ||
        !option.subscribe_price ||
        !option.normal_price ||
        !option.mrp_price
      ) {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "All fields in weight options (weight, subscribe_price, normal_price, mrp_price) are required.",
        });
      }
    }

    let imageUrl = null;
    if (req.files?.img) {
      imageUrl = await uploadToS3(req.files.img[0], "images");
    }
    console.log("Image URL:", imageUrl);

    let product;
    if (id) {
      // Update existing product
      product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "Product not found.",
        });
      }

      await product.update({
        title,
        img: imageUrl || product.img,
        status,
        cat_id,
        description,
        out_of_stock,
        subscription_required,
        discount: discount || product.discount,
        batch_number
      });

      // Fetch existing WeightOption and StoreWeightOption data to preserve quantity/total
      const oldWeightOptions = await WeightOption.findAll({
        where: { product_id: id },
      });
      const weightMap = new Map(
        oldWeightOptions.map(wo => [wo.weight, wo.id])
      );

      // Delete existing weight options
      await WeightOption.destroy({ where: { product_id: id } });

      // Create new weight options
      const weightOptionEntries = parsedWeightOptions.map((option) => ({
        product_id: id,
        weight: option.weight,
        subscribe_price: parseFloat(option.subscribe_price),
        normal_price: parseFloat(option.normal_price),
        mrp_price: parseFloat(option.mrp_price),
      }));
      const newWeightOptions = await WeightOption.bulkCreate(weightOptionEntries);

      // Update StoreWeightOption records in ProductInventory
      const inventories = await ProductInvetory.findAll({
        where: { product_id: id },
        include: [{ model: StoreWeightOption, as: "storeWeightOptions" }],
      });

      for (const inventory of inventories) {
        const oldStoreWeightOptions = inventory.storeWeightOptions || [];
        const storeWeightMap = new Map(
          oldStoreWeightOptions.map(swo => [
            oldWeightOptions.find(wo => wo.id === swo.weight_id)?.weight,
            { quantity: swo.quantity, total: swo.total },
          ])
        );

        // Delete existing StoreWeightOption records
        await StoreWeightOption.destroy({
          where: { product_inventory_id: inventory.id },
        });

        // Create new StoreWeightOption records
        const newStoreWeightOptions = parsedWeightOptions.map((option, index) => {
          const newWeightOption = newWeightOptions[index];
          const oldData = storeWeightMap.get(option.weight) || { quantity: 0, total: 0 };
          return {
            product_inventory_id: inventory.id,
            product_id: id,
            weight_id: newWeightOption.id,
            quantity: oldData.quantity,
            total: oldData.total,
          };
        });

        await StoreWeightOption.bulkCreate(newStoreWeightOptions);
      }

      console.log("Product updated successfully:", product.toJSON());
      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Product updated successfully.",
        product,
      });
    } else {
      // Check for duplicate title only when creating a new product
      const existingProduct = await Product.findOne({ where: { title } });
      if (existingProduct) {
        return res.status(409).json({
          ResponseCode: "409",
          Result: "false",
          ResponseMsg: "Product with this title already exists.",
        });
      }

      // Create new product
      product = await Product.create({
        title,
        img: imageUrl,
        status,
        cat_id,
        description,
        out_of_stock,
        subscription_required,
        discount: discount || "",
        batch_number
      });

      // Create new weight options
      const weightOptionEntries = parsedWeightOptions.map((option) => ({
        product_id: product.id,
        weight: option.weight,
        subscribe_price: parseFloat(option.subscribe_price),
        normal_price: parseFloat(option.normal_price),
        mrp_price: parseFloat(option.mrp_price),
      }));
      await WeightOption.bulkCreate(weightOptionEntries);

      console.log("Product created successfully:", product.toJSON());
      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Product created successfully.",
        product,
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
    });
  }
};


const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: WeightOption, as: "weightOptions" }], // Assuming association is set
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error)
  }
};



const getProductCount = asyncHandler(async (req, res) => {
  const ProductCount = await Product.count();
  const Products = await Product.findAll();
  logger.info("product counted successfully");
  res.status(200).json({ Products, Product: ProductCount });
});

const getProductById = asyncHandler(async (req, res) => {
  // Uncomment and use Joi validation if needed
  // const { error } = getproductByIdSchema.validate(req.params);
  // if (error) {
  //   logger.error(error.details[0].message);
  //   return res.status(400).json({ error: error.details[0].message });
  // }

  const { id } = req.params;

  // Fetch product with associated weightOptions
  const product = await Product.findOne({
    where: { id: id },
    include: [
      {
        model: WeightOption,
        as: "weightOptions", // Alias for the association (ensure this matches your model definition)
        attributes: ["weight", "subscribe_price", "normal_price", "mrp_price"], // Select specific fields
      },
    ],
  });

  if (!product) {
    logger.error("Product not found");
    return res.status(404).json({
      ResponseCode: "404",
      Result: "false",
      ResponseMsg: "Product not found",
    });
  }

  // Format the response to match your API style
  res.status(200).json({
    ResponseCode: "200",
    Result: "true",
    ResponseMsg: "Product retrieved successfully",
    data: {
      id: product.id,
      title: product.title,
      img: product.img,
      status: product.status,
      discount:product.discount,
      cat_id: product.cat_id,
      description: product.description,
      out_of_stock: product.out_of_stock,
      subscription_required: product.subscription_required,
      package_type: product.package_type,
      batch_number: product.batch_number,
      weightOptions: product.weightOptions, // Included from the association
    },
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("Received ID for deletion:", id);

  const product = await Product.findOne({ where: { id }, paranoid: false });

  if (!product) {
    logger.error(`Product not found for ID: ${id}`);
    return res.status(404).json({ error: "Product not found" });
  }

  await Product.destroy({where:{id}});
  logger.info("Product deleted successfully");
  return res.status(200).json({ message: "Product deleted successfully" });
});

const searchProduct = asyncHandler(async (req, res) => {
  const { id, title } = req.body;
  const whereClause = {};
  if (id) {
    whereClause.id = id;
  }

  if (title && title.trim() != "") {
    whereClause.title = { [Sequelize.Op.like]: `%${title.trim()}%` };
  }

  const product = await Product.findAll({ where: whereClause });

  if (product.length === 0) {
    logger.error("No matching admins found");
    return res.status(404).json({ error: "No matching admins found" });
  }
  res.status(200).json(product);
});

const toggleproductStatus = async (req, res) => {
  console.log("Request received:", req.body);

  const { id, value } = req.body;
  console.log(req.body, "ssssssssssssssssssssssssss")

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      console.log("product not found");
      return res.status(404).json({ message: "product not found." });
    }

    product.status = value;
    await product.save();

    console.log("product updated successfully:", product);
    res.status(200).json({
      message: "product status updated successfully.",
      updatedStatus: product.status,
    });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  upsertProduct,
  getAllProducts,
  getProductCount,
  getProductById,
  deleteProduct,
  searchProduct,
  toggleproductStatus,
};