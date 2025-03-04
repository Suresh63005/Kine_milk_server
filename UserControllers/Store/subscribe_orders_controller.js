const { Sequelize, Op } = require("sequelize");
const Rider = require("../../Models/Rider");
const SubscribeOrder = require("../../Models/SubscribeOrder");
const User = require("../../Models/User");
const asyncHandler = require("../../middlewares/errorHandler");
const Address = require("../../Models/Address");
const SubscribeOrderProduct = require("../../Models/SubscribeOrderProduct");
const Product = require("../../Models/Product");

const FetchSubscribeOrdersByStatus = asyncHandler(async (req, res) => {
    console.log("Decoded User:", req.user);
  
    const uid = req.user.userId;
    if (!uid) {
      return res.status(400).json({
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
        message:
          "Order status is required and should be either active, completed, or cancelled!",
      });
    }
  
    try {
      let queryFilter = { store_id };
      if (status === "active") {
        queryFilter.status = { [Op.in]: ["Pending", "Active"] };
      } else if (status === "completed") {
        queryFilter.status = "Completed";
      } else if (status === "cancelled") {
        queryFilter.status = "Cancelled";
      }
      console.log("Query Filter:", queryFilter);
  
      const orders = await SubscribeOrder.findAll({
        where: queryFilter,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: SubscribeOrderProduct,
            as: "orderProducts",
            include: [
              {
                model: Product,
                as: "productDetails",
                attributes: ["id", "title", "img"],
              },
            ]
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "mobile","email"],
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
          
        ],
      });
  
      console.log("Orders found:", orders);
  
      if (orders.length === 0) {
        return res
          .status(404)
          .json({ message: "No orders found for the given status." });
      }
  
      return res.status(200).json({
        ResponseCode: "200",
        Result: "true",
        ResponseMsg: "Orders fetched successfully",
        Data: orders,
      });
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      return res
        .status(500)
        .json({ message: "Internal server error: " + error.message });
    }
  });

  
   

const ViewSubscribeOrderById = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);

  const uid = req.user.userId;
  if (!uid) {
    return res.status(401).json({
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
    const order = await SubscribeOrder.findOne({
      where: { id: orderId, store_id: storeId },
      include:[
        {
          model:SubscribeOrderProduct,
          as:"orderProducts",
          include:[
            {
              model:Product,
              as:"productDetails",
              attributes:["id",
                  "title",
                  "description",
                  "normal_price",
                  "mrp_price",
                  "img",]
            }
          ]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "mobile","email"],
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
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    return res
      .status(200)
      .json({ message: "Order fetched successfully!", order });
  } catch (error) {
    console.error("Error fetching order by ID:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
});

const AssignOrderToRider = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);
  const uid = req.user.userId;
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
    return res
      .status(400)
      .json({ message: "Order ID and Rider ID are required!" });
  }
  try {
    const order = await SubscribeOrder.findOne({
      where: { id: order_id, status: "Pending" },
    });
    if (!order) {
      return res.status(404).json({ message: "Pending Order not found!" });
    }
    const rider = await Rider.findOne({ where: { id: rider_id, status: 1 } });
    if (!rider) {
      return res.status(404).json({ message: "Rider not found! OR inactive!" });
    }
    await SubscribeOrder.update(
      { rid: rider_id, status: "Active" },
      { where: { id: order_id } }
    );
    const updatedOrder = await SubscribeOrder.findOne({
      where: { id: order_id },
    });
    return res.status(200).json({
      message: "Order assigned to rider successfully!",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error assigning order:", error.message);
    return res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
  }
});

module.exports = {
  FetchSubscribeOrdersByStatus,
  ViewSubscribeOrderById,
  AssignOrderToRider,
};
