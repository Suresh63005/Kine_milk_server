const asynHandler = require("../middlewares/errorHandler");
const Product = require("../Models/Product");
const ProductInventory = require("../Models/ProductInventory");
const Store = require("../Models/Store");
const Coupons = require("../Models/Coupon");
const Coupon = require("../Models/Coupon");
const WeightOption = require("../Models/WeightOption")
const StoreWeightOption = require("../Models/StoreWeightOption")
const Categories = require("../Models/Category")

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

    const weightIds = weightOptions.map((option) => option.weight_id);
    const uniqueWeightIds = new Set(weightIds);
    if (uniqueWeightIds.size !== weightIds.length) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Duplicate weight IDs found in weightOptions. Each weight ID must be unique.",
      });
    }

    // Validate weightOptions
    for (const option of weightOptions) {
      if (!option.weight_id) {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Weight ID is required for all weight options.",
        });
      }
      const weightExists = await WeightOption.findOne({ where: { id: option.weight_id } });
      if (!weightExists) {
        return res.status(404).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: `Weight option with ID ${option.weight_id} not found.`,
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
        weight_id: option.weight_id,
        quantity: option.quantity,
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
        weight_id: option.weight_id,
        quantity: option.quantity,
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
    const productInv = await ProductInventory.findByPk(id, {
      include: [
        { model: Product, as: "inventoryProducts" },
        {
          model: StoreWeightOption,
          as: "storeWeightOptions",
          include: [{ model: WeightOption, as: "weightOption" }],
        },
      ],
    });

    if (!productInv) {
      return res.status(404).json({ message: "Product Inventory not found" });
    }

    const allCoupons = await Coupon.findAll();
    
    // Handle different coupon ID formats
    let couponIds = [];
    if (Array.isArray(productInv.Coupons)) {
      couponIds = productInv.Coupons;
    } else if (typeof productInv.Coupons === 'string') {
      try {
        couponIds = JSON.parse(productInv.Coupons);
      } catch (e) {
        console.error("Failed to parse Coupons field:", productInv.Coupons);
        couponIds = [];
      }
    }

    const coupons = couponIds.map((couponId) => {
      const coupon = allCoupons.find((c) => c.id === couponId);
      return coupon ? {
        id: coupon.id,
        coupon_title: coupon.coupon_title,
        coupon_value: coupon.coupon_val,
      } : null;
    }).filter(Boolean);

    const response = {
      ...productInv.toJSON(),
      coupons,
      storeWeightOptions: productInv.storeWeightOptions.map((option) => ({
        ...option.toJSON(),
        weight: option.weightOption?.weight,
        normal_price: option.weightOption?.normal_price || null,
        subscription_price: option.weightOption?.subscribe_price || null,
        mrp_price: option.weightOption?.mrp_price || null,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getProductInventoryById:", error);
    res.status(500).json({ message: "Failed to fetch product inventory details" });
  }
};
const ProductInventoryList = async (req, res) => {
  try {
    // First verify the weight options exist
    const testWeightOption = await WeightOption.findOne();
    console.log('Sample WeightOption:', testWeightOption?.toJSON());

    const productInv = await ProductInventory.findAll({
      include: [
        { 
          model: Product, 
          as: "inventoryProducts",
          include:[{
            
              model: Categories, 
              as: "category",
              attributes:["id","title"]
            
          }]
        },
        
        {
          model: StoreWeightOption,
          as: "storeWeightOptions",
          required:true,
          include: [{ 
            model: WeightOption, 
            as: "weightOption",
            required: false, 
            attributes: ['id', 'weight', 'normal_price', 'subscribe_price', 'mrp_price']
          }],
        },
      ],
    });

    const allCoupons = await Coupon.findAll();

    const response = productInv?.map((inventory) => {
      // Coupon handling (keep your existing code)
      let couponIds = [];
      
      // Handle different coupon ID formats
      if (Array.isArray(inventory.Coupons)) {
        couponIds = inventory.Coupons;
      } else if (typeof inventory.Coupons === 'string') {
        try {
          couponIds = JSON.parse(inventory.Coupons);
        } catch (e) {
          console.error("Failed to parse Coupons field:", inventory.Coupons);
          couponIds = [];
        }
      }

      // Map coupon IDs to coupon objects
      const coupons = couponIds?.map(couponId => {
          const coupon = allCoupons.find(c => c.id === couponId);
          return coupon ? {
            id: coupon.id,
            coupon_title: coupon.coupon_title,
            coupon_value: coupon.coupon_val
          } : null;
        })
        .filter(Boolean);


      const storeWeightOptions = inventory.storeWeightOptions.map((option) => {
        // Debug the raw option first
        console.log('StoreWeightOption:', option.toJSON());
        
        const weightOption = option.weightOption;
        console.log('Associated WeightOption:', weightOption?.toJSON());

        // Get prices from WeightOption if available, otherwise use StoreWeightOption
        return {
          id: option.id,
          product_inventory_id: option.product_inventory_id,
          product_id: option.product_id,
          weight_id: option.weight_id,
          quantity: option.quantity, // From StoreWeightOption
          total: option.total,       // From StoreWeightOption
          weight: weightOption?.weight || "N/A",
          normal_price: weightOption?.normal_price || option.normal_price || null,
          subscription_price: weightOption?.subscribe_price || option.subscription_price || null,
          mrp_price: weightOption?.mrp_price || option.mrp_price || null,
        };
      });

      return {
        ...inventory.toJSON(),
        coupons,
        storeWeightOptions,
      };
    }) || [];

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in ProductInventoryList:", error);
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
    await StoreWeightOption.destroy({ where: { product_inventory_id: id } });
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
          attributes: ["id","weight", "subscribe_price", "normal_price", "mrp_price"], // Select relevant fields
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

const deleteInventoryStoreWeightOptions = async (req, res) => {
  const { inventory_id, weight_id } = req.body;
  try {
    const storeWeightOption = await StoreWeightOption.findOne({
      where: { product_inventory_id: inventory_id, weight_id:weight_id },
    });
    if (!storeWeightOption) {
      return res.status(404).json({ message: "Store Weight Option not found" });
    }
    await storeWeightOption.destroy();
    res.status(200).json({ message: "Store Weight Option deleted successfully" });
  } catch (error) {
    console.error("Error deleting Store Weight Option:", error);
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
  deleteInventoryStoreWeightOptions
};
