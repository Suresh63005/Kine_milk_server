const Cart = require("../../Models/Cart");

const upsertCart = async (req, res) => {
    try {
      const { uid, product_id, quantity } = req.body;


  
      if (!uid || !product_id ) {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "Missing required fields!",
        });
      }
  
     
      const existingCartItem = await Cart.findOne({
        where: { uid, product_id },
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
        });
  
        return res.status(201).json({
          ResponseCode: "201",
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
    //   const uid  = req.user.id;
      const uid  = "2dfd7d77-e6f6-43f9-8cc1-c7f29fbd91b6";

      console.log(uid)
  
      if (!uid) {
        return res.status(400).json({
          ResponseCode: "400",
          Result: "false",
          ResponseMsg: "User ID is required!",
        });
      }
  
      const cartItems = await Cart.findAll({ where: { uid } });
  
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