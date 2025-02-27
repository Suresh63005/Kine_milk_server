const Product = require("../../Models/Product");
const { Op } = require("sequelize");
const asyncHandler = require("../../middlewares/errorHandler");
const logger = require("../../utils/logger");
const uploadToS3 = require("../../config/fileUpload.aws");
const Store = require("../../Models/Store");
const NormalOrder = require("../../Models/NormalOrder");
const Rider = require("../../Models/Rider");
const NormalOrderProduct = require("../../Models/NormalOrderProduct");

const ListAllInstantOrders = asyncHandler(async (req, res) => {
    console.log("Decoded User:", req.user);

    const { storeId } = req.params;

    const uid = req.user.userId;
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

const FetchAllInstantOrdersByStatus = asyncHandler(async (req, res) => {
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

    if (!store_id || !status) {
        return res.status(400).json({ message: "Store ID and status are required!" });
    }

    try {
        const orders = await NormalOrder.findAll({
            where: { store_id, status },
            order: [['createdAt', 'DESC']],
        });

        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found for the given status." });
        }

        return res.status(200).json({ message: "Orders fetched successfully!", orders });
    } catch (error) {
        console.error("Error fetching orders:", error.message);
        return res.status(500).json({ message: "Internal server error: " + error.message });
    }
});

const AssignOrderToRider = asyncHandler(async (req, res) => {
    
    const uid = "3aacc235-d219-4566-a00c-787765609da1";

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

        return res.status(200).json({
            message: "Order assigned to rider successfully!",
            order: updatedOrder
        });
    } catch (error) {
        console.error("Error assigning order:", error.message);
        return res.status(500).json({ message: "Internal server error: " + error.message });
    }
});

const ViewInstantOrderById = asyncHandler(async(req,res)=>{
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
    const {storeId,orderId}=req.body;
    if (!orderId) {
        return res.status(400).json({ message: "Order ID is required!" });
    }
    if (!storeId) {
        return res.status(400).json({ message: "Store ID is required!" });
    }
    try {
        const instantOrder = await NormalOrder.findOne({
            where: { id: orderId, store_id: storeId },
            include:[
                {
                    model:NormalOrderProduct,
                    as:"orderProducts",
                    include:[
                        {
                            model:Product,
                            as:"productDetails",
                            attributes: ["id", "title", "description", "normal_price", "mrp_price", "img"],
                        }
                    ]
                }
            ]
        });
        if(!instantOrder){
            return res.status(404).json({message:"Instant Order not found!"})
        }
        return res.status(200).json({message:"Instant Order Fetched Successfully!",instantOrder})
    } catch (error) {
        console.error("Error assigning order:", error.message);
        return res.status(500).json({ message: "Internal server error: " + error.message });
    }
})


module.exports = {ListAllInstantOrders,AssignOrderToRider,FetchAllInstantOrdersByStatus,ViewInstantOrderById}