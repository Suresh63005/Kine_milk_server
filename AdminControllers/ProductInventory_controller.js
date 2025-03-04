const Product = require("../Models/Product");
const ProductInventory = require("../Models/ProductInventory");
const Store = require("../Models/Store");

const addInventory = async (req, res) => {
  const { inventory_id, store_id, product_id, date, quantity, total } = req.body;
  
  try {
    if (!store_id || !product_id || !date || !quantity) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "All fields (store_id, product_id, date, quantity, total) are required.",
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
    
    let inventory;
    
    if (inventory_id) {
      inventory = await ProductInventory.findOne({
        where: { id: inventory_id, store_id, product_id }
      });
      
      if (inventory) {
        inventory.date = date || inventory.date;
        inventory.quantity = quantity || inventory.quantity;
        inventory.total = total || inventory.total;
        await inventory.save();
      } 
    } else {
      inventory = await ProductInventory.create({
        store_id,
        product_id,
        date,
        quantity,
        total,
        status: 1
      });
    }
    
    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Product inventory upserted successfully.",
      inventory,
    });
    
  } catch (error) {
    console.error("Error processing inventory upsert:", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
    });
  }
};


module.exports = {
  addInventory,
};
