const Cart = require("../../Models/Cart");
const Product = require("../../Models/Product");
const User = require("../../Models/User");
const cron = require('node-cron');
const WeightOption = require("../../Models/WeightOption");
const axios = require("axios");


const upsertCart = async (req, res) => {
    try {
      const { uid, product_id, quantity,orderType,weight_id } = req.body;

      if (!uid || !product_id || !orderType || !weight_id ) {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Missing required fields!",
        });
      }
  
      const existingCartItem = await Cart.findOne({
        where: { uid, product_id,orderType,weight_id },
      });
  
      if (existingCartItem) {
        await Cart.update(
          { quantity: existingCartItem.quantity + quantity },
          { where: { uid, product_id } }
        );
        return res.status(200).json({
          ResponseCode: "200",
          Result: "true",
          ResponseMsg: "Cart updated successfully!",
          
        });
      } else {
        const newCartItem = await Cart.create({
          uid,
          product_id,
          quantity,
          orderType,
          weight_id
        });
  
        return res.status(200).json({
          ResponseCode: "200",
          Result: "true",
          ResponseMsg: "Item added to cart!",
          data: newCartItem,
        });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Server Error",
        error: error.message,
      });
    }
  }

  const getCartByUser = async (req, res) => {
    try {
      const uid  = req.user.userId;
      const {orderType} = req.params;


    

      if (!uid) {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "User ID is required!",
        });
      }
  
      const cartItems = await Cart.findAll({ 
        where: { uid, orderType },
        include: [
          {
              model: Product,
              attributes: ["id", "title", "img", "description"],
              as: "CartproductDetails"
          },{
            model:WeightOption,
            as:"cartweight",
            attributes:["weight","subscribe_price","normal_price","mrp_price"]
          }
      ]
      });
  
      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Cart items retrieved successfully!",
        data: cartItems,
      });
    } catch (error) {
      console.error("Error fetching cart items:", error);
      res.status(500).json({
        ResponseCode: "500",
        Result: "false",
        ResponseMsg: "Server Error",
        error: error.message,
      });
    }
  }

  const deleteCart = async (req, res) => {
    const { id } = req.params;
    const uid = req.user.userId;
try {
  
  const cartItem = await Cart.destroy({ where: { id,uid },force:true });

  if(!cartItem){
    return res.status(404).json({
      ResponseCode: "404",
      Result: "false",
      ResponseMsg: "Cart item not found!",
    })
  }

  return res.status(200).json({
    ResponseCode: "200",
    Result: "true",
    ResponseMsg: "Cart item deleted successfully!",
  })



} catch (error) {
  
  console.error("Error deleting cart item:", error);
  res.status(500).json({
    ResponseCode: "500",
    Result: "false",
    ResponseMsg: "Server Error",
    error: error.message,
  })
}

  }

  const sendDailyCartNotifications = async () => {
    try {
      // Find users with items in their cart
      const userWithCartItems = await Cart.findAll({
        attributes: ["uid"],
        group: ["uid"],
      });
  
      const userIds = userWithCartItems.map((cart) => cart.uid); // Fix: Use uid, not id
      if (userIds.length === 0) {
        console.log("No users with items in the cart.");
        return;
      }
  
      // Fetch users with their one_subscription
      const users = await User.findAll({
        where: { id: userIds },
        attributes: ["id", "name", "one_subscription"],
      });
  
      if (users.length === 0) {
        console.log("No matching users found.");
        return;
      }
  
      // Send notifications to each user
      for (const user of users) {
        if (!user.one_subscription) {
          console.warn(`User ${user.id} (${user.name}) has no OneSignal subscription ID`);
          continue; // Skip if no subscription
        }
  
        try {
          const notificationContent = {
            app_id: process.env.ONESIGNAL_CUSTOMER_APP_ID,
            include_player_ids: [user.one_subscription],
            data: { user_id: user.id, type: "cart reminder" },
            contents: {
              en: `${user.name}, you have items in your cart. Complete your purchase today!`,
            },
            headings: { en: "Don't forget your cart!" },
          };
  
          const response = await axios.post(
            "https://onesignal.com/api/v1/notifications",
            notificationContent,
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                Authorization: `Basic ${process.env.ONESIGNAL_CUSTOMER_API_KEY}`,
              },
            }
          );
  
          if (response.data.errors) {
            throw new Error(response.data.errors[0]);
          }
          console.log(`Notification sent to ${user.name} (${user.id}):`, response.data);
        } catch (error) {
          const errorMsg = error.response?.data?.errors?.[0] || error.message;
          console.error(`Failed to send notification to ${user.name} (${user.id}): ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error("Error in sending daily cart notifications:", error.message);
    }
  };
  
  // Schedule to run daily at 10:00 PAM
  cron.schedule("00 10 * * *", () => {
    console.log("Running daily cart notification job at 10:00 AM...");
    sendDailyCartNotifications();
  });

  module.exports = {
    upsertCart,
    getCartByUser,
    deleteCart,
    sendDailyCartNotifications
  }