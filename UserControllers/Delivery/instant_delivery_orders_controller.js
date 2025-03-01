const { Op, Sequelize } = require("sequelize");
const Address = require("../../Models/Address");
const NormalOrder = require("../../Models/NormalOrder");
const NormalOrderProduct = require("../../Models/NormalOrderProduct");
const Product = require("../../Models/Product");
const Rider = require("../../Models/Rider"); // Import Rider model
const User = require("../../Models/User");
const asyncHandler = require("../../middlewares/errorHandler");

const FetchAllInstantDeliveryOrdersByStatus = asyncHandler(async (req, res) => {
    console.log("Decoded User:", req.user);
  
    const riderId = req.user?.riderId;
    const { status } = req.query;
  
    if (!riderId) {
      return res.status(401).json({
        ResponseCode: "401",
        Result: "false",
        ResponseMsg: "Rider ID not provided",
      });
    }
  
    if (!status || !["active", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        message:
          "Order status is required and should be either active, completed, or cancelled!",
      });
    }
  
    try {
      console.log("Fetching rider details for ID:", riderId);
  
      // Fetch rider details to get store_id
      const rider = await Rider.findOne({
        where: { id: riderId },
        attributes: ["store_id", "id", "title"],
      });
  
      if (!rider || !rider.store_id) {
        return res.status(404).json({ message: "Rider not assigned to any store!" });
      }
  
      const store_id = rider.store_id;
      console.log(`Fetching orders for Store ID: ${store_id} with Status: ${status}`);
  
      // Build the query filter dynamically
      let queryFilter = { store_id, rid: riderId };
      if (status === "active") {
        queryFilter.status = { [Op.in]: ["Pending", "Processing", "On Route"] };
      } else if (status === "completed") {
        queryFilter.status = "Completed";
      } else if (status === "cancelled") {
        queryFilter.status = "Cancelled";
      }
      console.log("Query Filter:", queryFilter);
  
      // Fetch orders assigned to the rider using the constructed filter
      const instantOrders = await NormalOrder.findAll({
        where: queryFilter,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: NormalOrderProduct,
            as: "NormalProducts",
            include: [
              {
                model: Product,
                as: "ProductDetails",
                attributes: [
                  "id",
                  "title",
                  "description",
                  "normal_price",
                  "mrp_price",
                  "img",
                ],
              },
            ],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "mobile"],
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
          },
        ],
      });
  
      if (!instantOrders.length) {
        return res.status(404).json({ message: "No orders found with the given status!" });
      }
  
      return res.status(200).json({
        message: "Orders Fetched Successfully!",
        orders: instantOrders,
      });
    } catch (error) {
      console.error("Error Occurs While Fetching ", error);
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  });

const AcceptInstantOrders = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);

  const riderId = req.user?.riderId;
  if (!riderId) {
    return res.status(400).json({
      success: false,
      message: "Rider ID not found in token",
    });
  }

  const { order_id } = req.body;
  if (!order_id) {
    return res.status(400).json({
      success: false,
      message: "Order ID is required!",
    });
  }

  try {
    const order = await NormalOrder.findOne({
      where: { id: order_id, rid: riderId, status: "Processing" },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or already processed!",
      });
    }

    await NormalOrder.update(
      { status: "On Route" },
      { where: { id: order_id } }
    );

    const updatedOrder = await NormalOrder.findOne({ where: { id: order_id } });

    return res.status(200).json({
      success: true,
      message: "Order accepted successfully! Status updated to 'On Route'.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error accepting order:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
});

const ViewOrderDetails = asyncHandler(async (req, res) => {
  console.log("Decoded User:", req.user);
  const riderId = req.user?.riderId;
  const { orderId } = req.query;

  if (!riderId) {
    return res.status(401).json({
      ResponseCode: "401",
      Result: "false",
      ResponseMsg: "Rider ID not provided",
    });
  }

  if (!orderId) {
    return res.status(400).json({
      ResponseCode: "400",
      Result: "false",
      ResponseMsg: "Order Id is required!",
    });
  }

  try {
    console.log(
      "Fetching order details for Order ID:",
      orderId,
      " and Rider ID:",
      riderId
    );

    // Fetch order details along with product details
    const order = await NormalOrder.findOne({
      where: { id: orderId, rid: riderId },
      include: [
        {
          model: NormalOrderProduct,
          as: "NormalProducts",
          include: [
            {
              model: Product,
              as: "ProductDetails",
              attributes: [
                "id",
                "title",
                "description",
                "normal_price",
                "mrp_price",
                "img",
              ],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "mobile"],
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

    if (!order) {
      return res.status(404).json({
        success: false,
        ResponseCode: "404",
        Result: "false",
        ResponseMsg: "Order not found or not assigned to this rider!",
      });
    }

    return res.status(200).json({
      success: true,
      ResponseCode: "200",
      Result: "true",
      ResponseMsg: "Order details fetched successfully",
      Data: order,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    return res.status(500).json({
      ResponseCode: "500",
      Result: "false",
      ResponseMsg: "Internal Server Error",
      Error: error.message,
    });
  }
});

module.exports = {
    FetchAllInstantDeliveryOrdersByStatus,
  ViewOrderDetails,
  AcceptInstantOrders,
};
