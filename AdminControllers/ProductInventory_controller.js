const asynHandler = require("../middlewares/errorHandler");
const Product = require("../Models/Product");
const ProductInventory = require("../Models/ProductInventory");
const Store = require("../Models/Store");
const Coupons = require("../Models/Coupon");
const Coupon = require("../Models/Coupon");

const addInventory = async (req, res) => {
  const { store_id, product_id, date, quantity, total,coupons } = req.body;
  console.log(req.body)
  
  try {
    if (!store_id || !product_id || !date || !quantity|| !coupons) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "All fields (store_id, product_id, date, quantity, total,coupons) are required.",
      });
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
    
    let inventory = await ProductInventory.findOne({
      where: { store_id, product_id }
    });

    if (inventory) {
      inventory.quantity = quantity || inventory.quantity;
      inventory.total = total || inventory.total;
      inventory.Coupons = coupons || inventory.Coupons
      await inventory.save();

      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Product inventory already exists, so it has been updated.",
        inventory,
      });
    } else {
      inventory = await ProductInventory.create({
        store_id,
        product_id,
        date,
        quantity,
        total,
        Coupons:coupons,
        status: 1
      });

      return res.status(201).json({
        ResponseCode: "201",
        Result: "true",
        ResponseMsg: "Product inventory created successfully.",
        inventory,
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
    // Fetch the product inventory by ID
    const productInv = await ProductInventory.findByPk(id, {
      include: [
        {
          model: Product,
          as: "inventoryProducts", // Include the Product model
        },
      ],
    });

    if (!productInv) {
      return res.status(404).json({ message: "Product Inventory not found" });
    }

    // Fetch all coupons from the Coupons model
    const allCoupons = await Coupon.findAll();

    // Extract the coupon IDs from the inventory's Coupons field
    const couponIds = productInv.Coupons || []; // Use Coupons instead of coupons

    // Find the corresponding coupon details from the allCoupons array
    const coupons = couponIds
      .map((couponId) => {
        const coupon = allCoupons.find((c) => c.id === couponId);
        return coupon
          ? {
              id: coupon.id, // Include the coupon ID
              coupon_title: coupon.coupon_title,
              coupon_value: coupon.coupon_val,
              // Add other coupon fields if needed
            }
          : null;
      })
      .filter(Boolean);

    
    const response = {
      ...productInv.toJSON(),
      coupons, 
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch product inventory details" });
  }
};
const ProductInventoryList = async (req, res) => {
  try {
    
    const productInv = await ProductInventory.findAll({
      include: [
        {
          model: Product,
          as: "inventoryProducts", 
        },
      ],
    });

   
    const allCoupons = await Coupon.findAll();

    
    const response = await Promise.all(
      productInv.map(async (inventory) => {
        
        const couponIds = inventory.Coupons || []; // Use Coupons instead of coupons

        // Find the corresponding coupon details from the allCoupons array
        const coupons = couponIds.map((couponId) => {
          const coupon = allCoupons.find((c) => c.id === couponId);
          return coupon
            ? {
                id: coupon.id,
                coupon_title: coupon.coupon_title,
                coupon_value: coupon.coupon_val,
                // Add other coupon fields if needed
              }
            : null;
        }).filter(Boolean); // Remove null values (invalid coupon IDs)

        // Return the inventory with the mapped coupons
        return {
          ...inventory.toJSON(),
          coupons, // Append the mapped coupons
        };
      })
    );

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
module.exports = {
  addInventory,
  getProductInventoryById,
  ProductInventoryList,
  toggleProductInventoryStatus,
  deleteProductInventory
};
