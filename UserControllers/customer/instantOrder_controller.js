

const { Sequelize, Op } = require("sequelize");

const Product = require("../../Models/Product");

const NormalOrder = require("../../Models/NormalOrder");
const NormalOrderProduct = require("../../Models/NormalOrderProduct");
const Notification = require("../../Models/Notification");
const User = require("../../Models/User");
const ProductReview = require("../../Models/ProductReview");
const Address = require("../../Models/Address");
const Time = require("../../Models/Time");
const Review = require("../../Models/review");
const Store = require("../../Models/Store");
const sequelize = require("../../config/db");

const generateOrderId = ()=>{
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `#${randomNum}`
}


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
      trans_id
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
          order_id:generateOrderId(),
          trans_id
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
        order_id: order.order_id,
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

     
      const validStatuses = ["Pending", "Processing", "Completed", "Cancelled", "On Route"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid order status" });
      }
  
      
      const orders = await NormalOrder.findAll({
        where: { uid, status },
        include: [
          {
            model: NormalOrderProduct,
            as: "NormalProducts", 
            include: [
              {
                model: Product,
                as: "ProductDetails", // Ensure 'productDetails' alias is correct in the model associations
                attributes: ["id", "title","img","subscribe_price", "description"] ,// Specify the fields you need
                include:[

                  {
                    model:ProductReview,
                    as:"ProductReviews",
                   
                  }
                ]
              },
             
             
            ],
            attributes:["pquantity",]
          },
           {
                model: Address,
                as:'instOrdAddress'
              },
              {
                model: Time,
                as: "timeslot",
                attributes:["id","mintime","maxtime"]
              },
              {
                model:Review,
                as:"normalorderdeliveryreview",
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
    const uid = req.user.userId;
  
    // Check if userId exists
    if (!uid) {
      return res.status(401).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "Unauthorized: User not found!",
      });
    }
  
    try {
      const { id } = req.params;
  
      // Combine both queries in one to reduce database calls
      const order = await NormalOrder.findOne({
        where: { id, uid: uid },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "mobile", "email"],
            include: [
              {
                model: Address,
                as: "addresses",
                attributes: [
                  "id",
                  "uid",
                  "address",
                  "landmark",
                  "r_instruction",
                  "a_type",
                  "a_lat",
                  "a_long",
                ],
              },
            ],
          },
          {
            model: NormalOrderProduct,
            as: "NormalProducts",
            include: [
              {
                model: Product,
                as: "ProductDetails",
              },
            ],
          },
          {
            model: Time,
            as: "timeslot",
            attributes:["id","mintime","maxtime"]
          }
        ],
        order: [["createdAt", "DESC"]],
      });
  
      // Check if order exists
      if (!order) {
        return res.status(404).json({
          ResponseCode: "404",
          Result: "false",
          ResponseMsg: "Order not found",
        });
      }
  
      // Return successful response
      res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Instant Order details fetched successfully!",
        orderDetails: order,
      });
  
    } catch (error) {
      console.error("Error fetching order details:", error.message);
  
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
  

const getRecommendedProducts = async(req,res)=>{
  console.log("Reached getRecommendedProducts API");
  // const uid = '8333f3ff-98fa-4df5-956c-4b58aabce493';
const uid = req.user?.id;

  if (!uid) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "User not authenticated",
    });
  }

  try {
    // Fetch recent orders for the user
    const recentOrders = await NormalOrder.findAll({
      where: { uid:uid },
      include: [
        {
          model: NormalOrderProduct,
          as: 'NormalProducts',
          attributes: ['product_id'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    if (!recentOrders.length) {
      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "No recent purchases found",
        recommendedProducts: [],
      });
    }

    // Extract product IDs from recent orders
    const productIds = [...new Set(recentOrders.flatMap(order => 
      order.orderProducts.map(op => op.product_id)
    ))];

    // Find similar products based on the category of purchased products
    const purchasedProducts = await Product.findAll({
      where: { id: productIds },
      attributes: ['cat_id'],
    });

    const categoryIds = [...new Set(purchasedProducts.map(p => p.category_id))];

    const recommendedProducts = await Product.findAll({
      where: { category_id: categoryIds, id: { [Op.notIn]: productIds } },
      attributes: ['id', 'name', 'normal_price', 'image'],
      limit: 10,
    });

    return res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Recommended products fetched successfully",
      recommendedProducts,
    });

  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Server Error",
      error: error.message,
    });
  }
}

const getNearByProducts = async(req,res)=>{
  const uid = req.user.userId;
  if(!uid){
    return res.status(401).json({message:"Unauthorized: User not found!"})
  }
  try {
    const userAddress = await Address.findOne({where:{uid:uid}})
    if (!userAddress) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "User address not found",
      });
    }
    const userLat = parseFloat(userAddress.a_lat);
    const userLong = parseFloat(userAddress.a_long);
    const distanceQuery = `
      (6371 * acos(
        cos(radians(${userLat})) *
        cos(radians(CAST(lats AS DOUBLE))) *
        cos(radians(CAST(longs AS DOUBLE)) - radians(${userLong})) +
        sin(radians(${userLat})) *
        sin(radians(CAST(lats AS DOUBLE)))
      ))`;

    const stores = await Store.findAll({
      where: sequelize.literal(`${distanceQuery} <= 10`),
    });
    if (stores.length === 0) {
      return res.status(404).json({
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "No stores found within 10km range",
      });
    }

    const storeIds = stores.map(store => store.id);

    const products = await Product.findAll({
      where: { store_id: { [Op.in]: storeIds } },
    });

    res.status(200).json({
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error fetching nearby products:", error);
    res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Server Error",
      error: error.message,
    });
  }
}

  module.exports = {
    instantOrder,
    getOrdersByStatus,
    getOrderDetails,
    cancelOrder,
    getRecommendedProducts,
    getNearByProducts
  };