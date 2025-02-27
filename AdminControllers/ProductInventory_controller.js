const Product = require("../Models/Product");
const ProductInventory = require("../Models/ProductInventory");
const Store = require("../Models/Store");



const addInventory =async (req, res)=>{
    const {store_id,product_id,date,quantity,total}= req.body;
try {

    if(!store_id||!product_id||!date||!quantity||!total){
        return res.status(400).json({
            ResponseCode: "400",
            Result: "false",
            ResponseMsg: "All fields are required.",
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

  const inventory = await ProductInventory.create({
    store_id,product_id,date,quantity,total,status:1
  });

  return res.status(201).json({
    ResponseCode: "201",
    Result: "true",
    ResponseMsg: "Product inventory created successfully.",
    inventory,
  });

} catch (error) {

    console.error("Error processing request:", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
    });
    
}

}


module.exports = {
    addInventory
}