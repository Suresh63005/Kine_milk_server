const Product = require("../../Models/Product");
const { Op, Sequelize } = require("sequelize");
const asyncHandler = require("../../middlewares/errorHandler");
const logger = require("../../utils/logger");
const uploadToS3 = require("../../config/fileUpload.aws");
const Store = require("../../Models/Store");
const NormalOrder = require("../../Models/NormalOrder");
const Rider = require("../../Models/Rider");
const NormalOrderProduct = require("../../Models/NormalOrderProduct");
const User = require("../../Models/User");
const Address = require("../../Models/Address");
const sequelize = require("../../config/db");
const ProductInvetory = require('../../Models/ProductInventory');
const Time = require("../../Models/Time");
const Notification = require("../../Models/Notification");

const ListAllInstantOrders = asyncHandler(async (req, res) => {

    const { storeId } = req.params;

    const uid = req.user.storeId;
    if (!uid) {
        return res.status(400).json({
            ResponseCode: "401",
            Result: "false",
            ResponseMsg: "User  ID not provided",
        });
    }

    console.log("Fetching orders for user ID:", uid);
    try {
        const instantOrders = await NormalOrder.findAll({
            where: { store_id: storeId },
            include:[
                {
                    model:User,
                    as:"user",
                    attributes:["id","name","mobile"],
                    on: { "$user.id$": { [Op.eq]: Sequelize.col
                    ("NormalOrder.uid") } },
                    include:[
                        {
                            model:Address,
                            as:"addresses",
                            attributes:["id","uid","address","landmark","r_instruction","a_type","a_lat","a_long",],
                        }
                    ]
                }
            ]
        });

        if (!instantOrders || instantOrders.length === 0) {
            return res.status(404).json({ message: "No instant orders found for this store!" });
        }

        return res.status(200).json({
            message: "Instant Orders Fetched Successfully.",
            instantOrders,
        });
    } catch (error) {
        console.error("Error Fetching instant orders", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
});

// const FetchAllInstantOrdersByStatus = asyncHandler(async (req, res) => {
//     console.log("Decoded User:", req.user);

//     const uid = req.user.userId;
//     if (!uid) {
//         return res.status(400).json({
//             ResponseCode: "401",
//             Result: "false",
//             ResponseMsg: "User ID not provided",
//         });
//     }

//     console.log("Fetching orders for user ID:", uid);
//     const { store_id, status } = req.body;

//     if (!store_id || !status) {
//         return res.status(400).json({ message: "Store ID and status are required!" });
//     }

//     try {
//         const orders = await NormalOrder.findAll({
//             where: { store_id, status },
//             order: [['createdAt', 'DESC']],
//         });

//         if (orders.length === 0) {
//             return res.status(404).json({ message: "No orders found for the given status." });
//         }

//         return res.status(200).json({ message: "Orders fetched successfully!", orders });
//     } catch (error) {
//         console.error("Error fetching orders:", error.message);
//         return res.status(500).json({ message: "Internal server error: " + error.message });
//     }
// });

const FetchAllInstantOrdersByStatus = asyncHandler(async (req, res) => {
    console.log("Decoded User:", req.user);
    const uid = req.user?.storeId; 

    if (!uid) {
        return res.status(401).json({
            ResponseCode: "401",
            Result: "false",
            ResponseMsg: "User ID not provided",
        });
    }

    console.log("Fetching orders for user ID:", uid);

    const { store_id, status } = req.body;

    if (!store_id) {
        return res.status(400).json({ message: "Store ID is required!" });
    }

    if (!status || !["active", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({
            message: "Order status is required and should be either active, completed, or cancelled!",
        });
    }

    try {
        let queryFilter = { store_id }; 

        if (status === "active") {
            queryFilter.status = { [Op.or]: ["Pending", "Processing", "On Route"] };
        } else if (status === "completed") {
            queryFilter.status = "Completed";
        } else if (status === "cancelled") {
            queryFilter.status = "Cancelled";
        }

        const orders = await NormalOrder.findAll({
            where: queryFilter,
            order: [["createdAt", "DESC"]],
            include:[
              {
                model:Time,
                as:"timeslot",
                attributes:['mintime','maxtime'],
                required:false
              },
              {
                model: NormalOrderProduct,
                as: "NormalProducts", 
                attributes: ["id", "product_id", "pquantity", "price"], 
                include: [
              {
                model: Product,
                as: "ProductDetails", 
                attributes: ["id", "title", "description"],
              },
            ],
              },
                {
                    model:User,
                    as:"user",
                    attributes:["id","name","mobile","email"],
                    on: { "$user.id$": { [Op.eq]: Sequelize.col("NormalOrder.uid") } },
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
                }
            ]
        });

        return res.status(200).json({
            ResponseCode: "200",
            Result: "true",
            ResponseMsg: "Orders fetched successfully",
            Data: orders,
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({
            ResponseCode: "500",
            Result: "false",
            ResponseMsg: "Internal server error",
            Error: error.message,
        });
    }
});


const AssignOrderToRider = asyncHandler(async (req, res) => {
    
    // const uid = "3aacc235-d219-4566-a00c-787765609da1";
    const uid = req.user?.storeId; 


    if (!uid) {
        return res.status(400).json({
            ResponseCode: "401",
            Result: "false",
            ResponseMsg: "User ID not provided",
        });
    }
    console.log("Fetching orders for user ID:", uid);
    
    const { order_id, rider_id } = req.body;
    if (!order_id || !rider_id) {
        return res.status(400).json({ message: "Order ID and Rider ID are required!" });
    }
    try {
        const order = await NormalOrder.findOne({ where: { id: order_id, status: "Pending" } });
        if (!order) {
            return res.status(404).json({ message: "Pending order not found!" });
        }

        const storeId = order.store_id;

        if (!storeId) {
            return res.status(404).json({ message: "Store ID not found for this order!" });
        }
                
        const rider = await Rider.findOne({ where: { id: rider_id, status: 1, store_id:storeId } });
        console.log(rider, "Rider******************************");
        if (!rider) {
            return res.status(404).json({ message: "Rider not found OR inactive!" });
        }

        await NormalOrder.update(
            { rid: rider_id, status: "Processing" },
            { where: { id: order_id } }
        );

        const updatedOrder = await NormalOrder.findOne({ where: { id: order_id } });

        try {
          const riderNotificationContent = {
            app_id: process.env.ONESIGNAL_APP_ID,
            include_player_ids: [rider.one_subscription],
            data: { rider_id: rider.id, type: "order assigned" },
            contents: {
              en: `You have been assigned a new order! Order ID: ${updatedOrder.order_id}`,
            },
            headings: { en: "New Order Assignment" },
          };
    
          const riderResponse = await axios.post(
            "https://onesignal.com/api/v1/notifications",
            riderNotificationContent,
            {
              headers: {
                "Content-Type": "application/json; charset=utf-8",
                Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
              },
            }
          );
          console.log(riderResponse.data, "rider notification sent");
        } catch (error) {
          console.log("Rider notification error:", error);
        }

        await Notification.create(
          {
            uid: rider.id, 
            datetime: new Date(),
            title: "New Order Assigned",
            description: `You have been assigned Order ID ${updatedOrder.order_id}.`,
          },)

        return res.status(200).json({
            message: "Order assigned to rider successfully!",
            order: updatedOrder
        });
    } catch (error) {
        console.error("Error assigning order:", error.message);
        return res.status(500).json({ message: "Internal server error: " + error.message });
    }
});

const ViewInstantOrderById = asyncHandler(async (req, res) => {
    console.log("Decoded User:", req.user);
    const uid = req.user.storeId;
    if (!uid) {
      return res.status(400).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "User ID not provided",
      });
    }
    console.log("Fetching orders for user ID:", uid);
    const { storeId, orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required!" });
    }
    if (!storeId) {
      return res.status(400).json({ message: "Store ID is required!" });
    }
    try {
      const instantOrder = await NormalOrder.findOne({
        where: { id: orderId, store_id: storeId },
        include: [
          {
            model:Time,
            as:"timeslot",
            attributes:["mintime","maxtime"],
            where:{store_id:storeId},
            required:false
          },
          {
            model: NormalOrderProduct,
            as: "NormalProducts", 
            attributes: ["id", "product_id", "pquantity", "price"], // Include `product_id` here
            include: [
              {
                model: Product,
                as: "ProductDetails", 
                attributes: ["id", "title", "description","img"],
              },
            ],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "mobile", "email"],
            include: [
              {
                model: Address,
                as: "addresses",
                attributes: ["id", "uid", "address", "landmark", "r_instruction", "a_type", "a_lat", "a_long"],
              },
            ],
          },
        ],
      });
      
      if (!instantOrder) {
        return res.status(404).json({ message: "Instant Order not found!" });
      }
      return res.status(200).json({
        message: "Instant Order Fetched Successfully!",
        instantOrder,
      });
    } catch (error) {
      console.error("Error assigning order:", error.message);
      return res.status(500).json({
        message: "Internal server error: " + error.message,
      });
    }
  });
  

  const getRecommendedProducts = async (req, res) => {
    console.log("Reached getRecommendedProducts API");
    
    const uid = req.user?.id; // Use authenticated user ID
    console.log("Authenticated User ID:", uid);
  
    if (!uid) {
      return res.status(400).json({
        ResponseCode: "400",
        Result: "false",
        ResponseMsg: "User not authenticated",
      });
    }
  
    try {
      const recentOrders = await NormalOrder.findAll({
        where: { uid },
        include: [
          {
            model: NormalOrderProduct,
            as: 'NormalProducts', // Ensure correct alias
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
  
      const productIds = [...new Set(recentOrders.flatMap(order => 
        order.NormalProducts.map(op => op.product_id) // Fix alias here
      ))];
  
      const purchasedProducts = await Product.findAll({
        where: { id: productIds },
        attributes: ['cat_id'],
      });
  
      const categoryIds = [...new Set(purchasedProducts.map(p => p.cat_id))];
  
      const recommendedProducts = await Product.findAll({
        where: { cat_id: categoryIds, id: { [Op.notIn]: productIds } },
        attributes: ['id', 'title', 'img'],
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
  };
  
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
  
      const products = await ProductInvetory.findAll({
        where: { store_id: { [Op.in]: storeIds } },
        include:
        [
          {
            model:Product,
            as:"inventoryProducts",
            attributes:["id","title","img"]
          }
        ]
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
  ListAllInstantOrders,
  AssignOrderToRider,
  FetchAllInstantOrdersByStatus,
  ViewInstantOrderById,
  getRecommendedProducts,
  getNearByProducts
};