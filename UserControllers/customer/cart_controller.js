const Cart = require("../../Models/Cart");
const Product = require("../../Models/Product");

const upsertCart = async (req, res) => {
    try {
      const { uid, product_id, quantity,orderType } = req.body;

      if (!uid || !product_id || !orderType ) {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Missing required fields!",
        });
      }
  
      const existingCartItem = await Cart.findOne({
        where: { uid, product_id,orderType },
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
          orderType
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
              attributes: ["id", "title", "img","normal_price","subscribe_price", "description"],
              as: "CartproductDetails" 
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
  

  module.exports = {
    upsertCart,
    getCartByUser
  }