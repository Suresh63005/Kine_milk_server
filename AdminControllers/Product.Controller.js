const Product = require("../Models/Product");
const { Op } = require("sequelize");
const asyncHandler = require("../middlewares/errorHandler");
const logger = require("../utils/logger");
const uploadToS3 = require("../config/fileUpload.aws");
const Store = require("../Models/Store");

const ProductImage = require("../Models/productImages");

const upsertProduct = async (req, res) => {
  try {
    const {
      id,
      title,
      status,
      cat_id,
      description,
      subscribe_price,
      normal_price,
      mrp_price,
      discount,
      out_of_stock,
      subscription_required,
      weight
    } = req.body;

    console.log("Request body:", req.body);

    // Validate required fields
    if (
      !title ||
      !status ||
      !cat_id ||
      !subscribe_price ||
      !normal_price ||
      !mrp_price ||
      !discount ||
      !out_of_stock ||
      !subscription_required
      // !weight
    ) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "All fields are required.",
      });
    }

    let imageUrl = null;
   

 
    if (req.files?.img) {
      imageUrl = await uploadToS3(req.files.img[0], "images");
    }

   

    let product;
    if (id) {
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
        subscribe_price,
        normal_price,
        mrp_price,
        discount,
        out_of_stock,
        subscription_required,
        // weight
      });

     

      console.log("Product updated successfully:", product);
      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Product updated successfully.",
        product,
      });
    } else {
      // Create new product
      product = await Product.create({
        title,
        img: imageUrl,
        status,
        cat_id,
        description,
        subscribe_price,
        normal_price,
        mrp_price,
        discount,
        out_of_stock,
        subscription_required,
        // weight
      });

     

      console.log("Product created successfully:", product);
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


const getAllProducts = asyncHandler(async (req, res, next) => {



  try {

    const Products = await Product.findAll();
    logger.info("successfully get all products");
    res.status(200).json(Products);

  } catch (error) {
    console.log(error)

  }
});

const getProductCount = asyncHandler(async (req, res) => {
  const ProductCount = await Product.count();
  const Products = await Product.findAll();
  logger.info("product counted successfully");
  res.status(200).json({ Products, Product: ProductCount });
});

const getProductById = asyncHandler(async (req, res) => {
  // const {error}=getproductByIdSchema.validate(req.params)
  // if (error) {
  //     logger.error(error.details[0].message)
  //     return res.status(400).json({ error: error.details[0].message });
  // }
  const { id } = req.params;
  const product = await Product.findOne({ where: { id: id } });
  if (!product) {
    logger.error("Product not found");
    return res.status(404).json({ error: "Product not found" });
  }
  res.status(200).json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;


  const product = await Product.findOne({ where: { id }, paranoid: false });

  if (!product) {
    logger.error("");
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