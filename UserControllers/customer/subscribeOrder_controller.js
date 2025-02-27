const { Sequelize } = require("sequelize");
const SubscribeOrder = require("../../Models/SubscribeOrder");
const Product = require("../../Models/Product");
const SubscribeOrderProduct = require("../../Models/SubscribeOrderProduct");
const Notification = require("../../Models/Notification");
const NormalOrder = require("../../Models/NormalOrder");


const subscribeOrder =  async (req, res) => {
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
      // Start a transaction
      

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
  
          const itemPrice = product.subscribe_price * item.quantity;
  
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

      await Notification.create(
{
    uid, 
    datetime: new Date(),
        title: "Order Confirmed",
        description: `Your order created  Order ID ${order.id} .`,
}
      )

     
  
     
  
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


  const getOrdersByStatus = async (req, res) => {
    try {
      const { uid, status } = req.body;

      console.log()
  
      
      const validStatuses = ["Pending", "Processing", "Completed", "Cancelled", "On Route"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid order status" });
      }
  
      
      const orders = await SubscribeOrder.findAll({
        where: { uid, status },
        include: [
          {
            model: SubscribeOrderProduct,
            as: "orderProducts", // Ensure 'orderProducts' alias is correct in the model associations
            include: [
              {
                model: Product,
                as: "productDetails", // Ensure 'productDetails' alias is correct in the model associations
                attributes: ["id", "title","img","subscribe_price", "description"] // Specify the fields you need
              }
            ],
            attributes:["pquantity",]
          }
        ],
        order: [["createdAt", "DESC"]], 
        attributes: ["id", "uid", "status", "createdAt"], 
      });
      
  
      res.status(201).json({
        ResponseCode: "201",
        Result: "true",
        ResponseMsg: "Subscribe Order fetched successfully!",
        orders
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Server Error",
        error: error.message,
      });
    }
  };

  const getOrderDetails = async (req, res) => {
    const {id} = req.params;


    try {

      const orderDetails  = await SubscribeOrder.findOne({
        where: { id },
        include: [
          {
            model: SubscribeOrderProduct,
            as: "orderProducts", 
            include: [
              {
                model: Product,
                as: "productDetails", // Ensure 'productDetails' alias is correct in the model associations
                attributes: ["id", "title","img","subscribe_price", "description"] // Specify the fields you need
              }
            ],
            attributes:["pquantity",]
          }
        ],
        order: [["createdAt", "DESC"]], 
        attributes: ["id", "uid", "status", "createdAt"],
      });

      if(!orderDetails){
        console.error("Error fetching order details:", error);
  
        res.status(404).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "Order Not Found",
          error: error.message,
        });
      }

      return res.status(201).json({
        ResponseCode: "201",
        Result: "true",
        ResponseMsg: "Instant Order fetched successfully!",
        orderDetails
      });
      
    } catch (error) {
      console.error("Error  order:", error);
  
      res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Server Error",
        error: error.message,
      });
    }

  }

  const cancelOrder = async (req, res) => {
    try {
      const { id } = req.body;
  
      // Find the order
      const order = await SubscribeOrder.findOne({ where: { id } });
  
      if (!order) {
        return res.status(400).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "Order not found",
          
        });
      }
  
      if (order.status === "Cancelled") {
        
        return res.status(400).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "Order is already cancelled",
          
        });
      }
      order.status = "Cancelled";
      await order.save();
  
      res.status(200).json({
        ResponseCode: "201",
        Result: "true",
        ResponseMsg: "Order cancelled successfully!",
        order
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
     
    }
  };


  module.exports = {
    subscribeOrder,
    getOrdersByStatus,
    getOrderDetails,
    cancelOrder
  };