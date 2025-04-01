const asynHandler = require("../middlewares/errorHandler");
const Product = require("../Models/Product");
const ProductInventory = require("../Models/ProductInventory");
const Store = require("../Models/Store");
const Coupons = require("../Models/Coupon");
const Coupon = require("../Models/Coupon");
const WeightOption = require("../Models/WeightOption")
const StoreWeightOption = require("../Models/StoreWeightOption")

const upsertInventory = async (req, res) => {
  const { id, store_id, product_id, date, weightOptions, coupons } = req.body;
  console.log(req.body);

  try {
    // Validation
    if (!store_id || !product_id || !weightOptions || weightOptions.length === 0) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "All fields (store_id, product_id, weightOptions) are required.",
      });
    }

    // Validate weightOptions
    for (const option of weightOptions) {
      if (!option.weight || option.weight.trim() === "") {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Weight is required for all weight options.",
        });
      }
    }

    const store = await Store.findOne({ where: { id: store_id } });
    if (!store) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Store not found.",
      });
    }

    const product = await Product.findOne({ where: { id: product_id } });
    if (!product) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Product not found.",
      });
    }

    if (!id) {
      const existingInventory = await ProductInventory.findOne({
        where: { store_id, product_id },
      });
      if (existingInventory) {
        return res.status(409).json({
          ResponseCode: "409",
          Result: "false",
          ResponseMsg: "This product is already added. Please go to the product list and modify it.",
        });
      }
    }

    let inventory;
    if (id) {
      inventory = await ProductInventory.findOne({ where: { id } });
      if (!inventory) {
        return res.status(404).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "Inventory not found.",
        });
      }
      inventory.date = date || inventory.date;
      inventory.Coupons = coupons || inventory.Coupons;
      await inventory.save();

      await StoreWeightOption.destroy({ where: { product_inventory_id: inventory.id } });
      const weightOptionRecords = weightOptions.map((option) => ({
        product_inventory_id: inventory.id,
        product_id,
        weight: option.weight,
        quantity: option.quantity,
        unit_price: option.unit_price,
        total: option.total,
      }));
      await StoreWeightOption.bulkCreate(weightOptionRecords);

      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Product inventory updated successfully.",
        inventory: {
          ...inventory.toJSON(),
          storeWeightOptions: weightOptionRecords,
        },
      });
    } else {
      inventory = await ProductInventory.create({
        store_id,
        product_id,
        date: date || new Date().toISOString().split("T")[0],
        Coupons: coupons,
        status: 1,
      });

      const weightOptionRecords = weightOptions.map((option) => ({
        product_inventory_id: inventory.id,
        product_id,
        weight: option.weight,
        quantity: option.quantity,
        unit_price: option.unit_price,
        total: option.total,
      }));
      await StoreWeightOption.bulkCreate(weightOptionRecords);

      return res.status(201).json({
        ResponseCode: "201",
        Result: "true",
        ResponseMsg: "Product inventory created successfully.",
        inventory: {
          ...inventory.toJSON(),
          storeWeightOptions: weightOptionRecords,
        },
      });
    }
  } catch (error) {
    console.error("Error processing inventory upsert:", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
    });
  }
};

const getProductInventoryById = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Fetch the product inventory by ID with associated Product and StoreWeightOptions
    const productInv = await ProductInventory.findByPk(id, {
      include: [
        {
          model: Product,
          as: "inventoryProducts", // Include the Product model
        },
        {
          model: StoreWeightOption,
          as: "storeWeightOptions", // Include the StoreWeightOption model
        },
      ],
    });

    if (!productInv) {
      return res.status(404).json({ message: "Product Inventory not found" });
    }

    // Fetch all coupons from the Coupons model
    const allCoupons = await Coupon.findAll();

    // Extract the coupon IDs from the inventory's Coupons field
    const couponIds = productInv.Coupons || [];

    // Find the corresponding coupon details from the allCoupons array
    const coupons = couponIds
      .map((couponId) => {
        const coupon = allCoupons.find((c) => c.id === couponId);
        return coupon
          ? {
              id: coupon.id,
              coupon_title: coupon.coupon_title,
              coupon_value: coupon.coupon_val,
              // Add other coupon fields if needed
            }
          : null;
      })
      .filter(Boolean);

    // Prepare the response
    const response = {
      ...productInv.toJSON(),
      coupons,
      storeWeightOptions: productInv.storeWeightOptions, // Already included via association
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch product inventory details" });
  }
};
const ProductInventoryList = async (req, res) => {
  try {
    // Fetch all product inventories with associated Product and StoreWeightOptions
    const productInv = await ProductInventory.findAll({
      include: [
        {
          model: Product,
          as: "inventoryProducts",
        },
        {
          model: StoreWeightOption,
          as: "storeWeightOptions",
        },
      ],
    });

    // Fetch all coupons from the Coupons model
    const allCoupons = await Coupon.findAll();

    // Map each inventory with its coupons and weight options
    const response = productInv.map((inventory) => {
      const couponIds = inventory.Coupons || [];

      // Find the corresponding coupon details from the allCoupons array
      const coupons = couponIds
        .map((couponId) => {
          const coupon = allCoupons.find((c) => c.id === couponId);
          return coupon
            ? {
                id: coupon.id,
                coupon_title: coupon.coupon_title,
                coupon_value: coupon.coupon_val,
                // Add other coupon fields if needed
              }
            : null;
        })
        .filter(Boolean);

      // Return the inventory with mapped coupons and weight options
      return {
        ...inventory.toJSON(),
        coupons,
        storeWeightOptions: inventory.storeWeightOptions, // Already included via association
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch product inventory list" });
  }
};


const toggleProductInventoryStatus=async (req,res)=>{
  const  {id ,value}=req.body;
  try {
    const productInv=await ProductInventory.findByPk(id);
    if(!productInv){
      return res.status(404).json({message:"Product Inventory not found"})
    }
    productInv.status=value;
    await productInv.save();
    res.status(200).json({
      message:"Product Inventory status updated successfully",
      updatedStatus:productInv.status
    })
  } catch (error) {
      res.status(500).json({message:"Internal Server Error"})
  }
}

const deleteProductInventory = async (req, res) => {
  const { id } = req.params;
  const { forceDelete } = req.body;
  try {
    const productInv = await ProductInventory.findByPk(id);
    if (!productInv) {
      return res.status(404).json({ message: "Product Inventory not found" });
    }
    if (productInv.deletedAt && forceDelete !== true) {
      return res.status(400).json({ message: "Product Inventory already deleted" });
    }
    if (forceDelete === true) {
      await productInv.destroy({ force: true });
      return res
        .status(200)
        .json({ message: "Product Inventory permanently deleted successfully" });
    }
    await productInv.destroy();
    return res.status(200).json({ message: "Product Inventory soft deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

 // Ensure WeightOption model is imported

const getProductsbyStore = async (req, res, next) => {
  try {
    const { store_id } = req.params;

    if (!store_id) {
      return res.status(400).json({ message: "Store ID is required" });
    }

    // Fetch categories associated with the store_id
    const store = await Store.findOne({
      where: { id: store_id },
      attributes: ["catid"], // Assuming 'catid' contains category IDs in JSON format
    });

    if (!store || !store.catid) {
      return res.status(404).json({ message: "Store not found or no categories linked" });
    }

    // Parse catid properly (Handles cases where it's stored as JSON or CSV)
    let categoryIds;
    try {
      categoryIds = JSON.parse(store.catid); // Try parsing as JSON
    } catch (error) {
      categoryIds = store.catid.split(",").map((id) => id.trim()); // Fallback to CSV
    }

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(200).json({ message: "No categories found for this store", products: [] });
    }

    // Fetch all product details that belong to these category IDs, including weight options
    const products = await Product.findAll({
      where: {
        cat_id: categoryIds, // Sequelize automatically converts array to IN condition
      },
      include: [
        {
          model: WeightOption,
          as: "weightOptions", // Assuming the association alias is 'weightOptions'
          attributes: ["weight", "subscribe_price", "normal_price", "mrp_price"], // Select relevant fields
        },
      ],
      attributes: { exclude: [] }, // Fetch all columns of Product
    });

    console.info("Successfully retrieved products by store with weight options");
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



module.exports = {
  upsertInventory,
  getProductInventoryById,
  ProductInventoryList,
  toggleProductInventoryStatus,
  deleteProductInventory,
  getProductsbyStore,
};
