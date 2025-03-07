

const { Sequelize } = require("sequelize");

const Product = require("../../Models/Product");

const NormalOrder = require("../../Models/NormalOrder");
const NormalOrderProduct = require("../../Models/NormalOrderProduct");
const Notification = require("../../Models/Notification");
const User = require("../../Models/User");


const instantOrder =  async (req, res) => {
    const {
      products, 
      timeslot_id,
      o_type,
      cou_id,
      cou_amt,
      subtotal,
      d_charge,
      store_charge,
      tax,
      o_total,
      odate,
      store_id,
      address_id,
      a_note,
    } = req.body;

    console.log(req.body);

    const uid = req.user.userId;
  
    if (!uid || !products || !products.length || !timeslot_id || !o_type || !store_id || !subtotal || !o_total ||!odate) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "Missing required fields!",
      });
    }
  
    try {

      const user = await User.findByPk(uid);

      if(!user){
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "User not found",
          });

      }
      
      
  
      // Create the order
      const order = await NormalOrder.create(
        {
          uid,
          store_id,
          address_id,
          odate,
          timeslot_id,
          o_type,
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
  
          const itemPrice = product.normal_price * item.quantity;
  
          return NormalOrderProduct.create(
            {
              oid: order.id,
              product_id: item.product_id,
              pquantity: item.quantity,
              price: itemPrice,
            },
            
          );
        })
      );


      try {
        const notificationContent = {
          app_id: process.env.ONESIGNAL_APP_ID,
          include_player_ids: [user.one_subscription],
          data: { user_id: user.id, type: "instant order placed" },
          contents: {
            en: `${user.name}, Your order  has been confirmed!`,
          },
          headings: { en: "Order Confirmed!" },
        };
  
        const response = await axios.post(
          "https://onesignal.com/api/v1/notifications",
          notificationContent,
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
            },
          }
        );
  
        console.log(response, "notification sent");
      } catch (error) {
        console.log(error);
      }



      await Notification.create(
        {
            uid, 
            datetime: new Date(),
                title: "Order Instant Confirmed",
                description: `Your order created  Order ID ${order.id} .`,
        }
              )
  
      res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Instant Order created successfully!",
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
  
      
      const orders = await NormalOrder.findAll({
        where: { uid, status },
        include: [
          {
            model: NormalOrderProduct,
            as: "NormalProducts", // Ensure 'orderProducts' alias is correct in the model associations
            include: [
              {
                model: Product,
                as: "ProductDetails", // Ensure 'productDetails' alias is correct in the model associations
                attributes: ["id", "title","img","subscribe_price", "description"] // Specify the fields you need
              }
            ],
            attributes:["pquantity",]
          }
        ],
        order: [["createdAt", "DESC"]],
      });
  
      res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Instant Order fetched successfully!",
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
    try {
      const { id } = req.params;
  
      
      const order = await NormalOrder.findOne({ where: { id } });

      const orderDetails  = await NormalOrder.findOne({
        where: { id },
        include: [
          {
            model: NormalOrderProduct,
            as: "NormalProducts", 
            include: [
              {
                model: Product,
                as: "ProductDetails", 
              }
            ],
            
          }
        ],
        order: [["createdAt", "DESC"]], 
        
      });
  
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
  
      res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Instant Order details fetched successfully!",
        orderDetails
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Server Error",
        error: error.message,
      });
    }
  };


  const cancelOrder = async (req, res) => {
    try {
      const { id } = req.body;
 
      const uid = req.user.userId;
  
      // Find the order
      const order = await NormalOrder.findOne({ where: { id } });
  
      if (!order) {
        return res.status(400).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "Order not found",
          
        });
      }

      const user = await User.findByPk(uid);

      if(!user){
        return res.status(400).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "User not found",
        })
          
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

    

      
      try {
        const notificationContent = {
          app_id: process.env.ONESIGNAL_APP_ID,
          include_player_ids: [user.one_subscription],
          data: { user_id: user.id, type: "instant order Cancelled" },
          contents: {
            en: `${user.name}, Your order  has been Cancelled!`,
          },
          headings: { en: "Order Cancelled!" },
        };
  
        const response = await axios.post(
          "https://onesignal.com/api/v1/notifications",
          notificationContent,
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
            },
          }
        );
  
        console.log(response, "notification sent");
      } catch (error) {
        console.log(error);
      }

      await Notification.create(
        {
            uid, 
            datetime: new Date(),
                title: "Order Instant Confirmed",
                description: `Your order created  Order ID ${order.id} .`,
        }
              )


  
     
      res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Order cancelled successfully!",
        order
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
     
    }
  };
  


  module.exports = {
    instantOrder,
    getOrdersByStatus,
    getOrderDetails,
    cancelOrder
  };