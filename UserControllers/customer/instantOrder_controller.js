

const { Sequelize } = require("sequelize");
const SubscribeOrder = require("../../Models/SubscribeOrder");
const Product = require("../../Models/Product");
const SubscribeOrderProduct = require("../../Models/SubscribeOrderProduct");


const instantOrder =  async (req, res) => {
    const {
      products, 
      start_date,
      end_date,
      days,
      timeslot_id,
      o_type,
      cou_id,
      cou_amt,
      subtotal,
      d_charge,
      store_charge,
      tax,
      o_total,
      store_id,
      address_id,
      a_note,
    } = req.body;

    console.log(req.body);

    const uid = "2dfd7d77-e6f6-43f9-8cc1-c7f29fbd91b6";
  
    if (!uid || !products || !products.length || !start_date || !days || !timeslot_id || !o_type || !store_id || !subtotal || !o_total) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Missing required fields!",
      });
    }
  
    try {
      
      const odate = new Date();
  
      // Create the order
      const order = await SubscribeOrder.create(
        {
          uid,
          store_id,
          address_id,
          odate,
          timeslot_id,
          o_type,
          start_date,
          end_date: end_date || null,
          days,
          cou_id: cou_id || null,
          cou_amt: cou_amt || 0,
          subtotal,
          d_charge: d_charge || 0,
          store_charge: store_charge || 0,
          tax: tax || 0,
          o_total,
          a_note,
        },
        
      );
  
     console.log(order,"from ordder")
      const orderItems = await Promise.all(
        products.map(async (item) => {
          const product = await Product.findByPk(item.product_id);
          if (!product) throw new Error(`Product with ID ${item.product_id} not found`);
  
          const itemPrice = product.price * item.quantity;
  
          return SubscribeOrderProduct.create(
            {
              oid: order.id,
              product_id: item.product_id,
              pquantity: item.quantity,
              price: itemPrice,
            },
            
          );
        })
      );
  
      res.status(201).json({
        ResponseCode: "201",
        Result: "true",
        ResponseMsg: "Order created successfully!",
        order_id: order.id,
        o_total,
        items: orderItems,
      });
    } catch (error) {
      console.error("Error creating order:", error);
  
      res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Server Error",
        error: error.message,
      });
    }
  }


  module.exports = instantOrder;