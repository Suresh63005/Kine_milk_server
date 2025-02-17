const NormalOrder = require('../../Models/NormalOrder');
const NormalOrderProduct = require('../../Models/NormalOrderProduct');
const Product = require('../../Models/Product');
const Rider = require('../../Models/Rider'); // Import Rider model
const asyncHandler = require('../../middlewares/errorHandler');

const FetchAllInstantDeliveryOrders = asyncHandler(async (req, res) => {
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

    if (!status) {
        return res.status(400).json({ message: "Order status is required!" });
    }

    try {
        console.log("Fetching rider details for ID:", riderId);

        // Fetch rider details to get store_id
        const rider = await Rider.findOne({ where: { id: riderId }, attributes: ["store_id","id","title"] });

        if (!rider || !rider.store_id) {
            return res.status(404).json({ message: "Rider not assigned to any store!" });
        }

        const store_id = rider.store_id; // Now store_id is defined

        console.log(`Fetching orders for Store ID: ${store_id} with Status: ${status}`);

        // Fetch orders assigned to the rider
        const instantOrders = await NormalOrder.findAll({
            where: { store_id, rid: riderId, status },
            include: [
                {
                    model: NormalOrderProduct,
                    as: "orderProducts",
                    include: [
                        {
                            model: Product,
                            as: "productDetails",
                            attributes: ["id", "title", "description", "normal_price","mrp_price", "img"],
                        }
                    ]
                }
            ]
        });

        if (!instantOrders.length) {
            return res.status(404).json({ message: "No orders found with the given status!" });
        }

        return res.status(200).json({
            message: "Orders Fetched Successfully!",
            orders: instantOrders
        });

    } catch (error) {
        console.error("Error Occurs While Fetching ", error);
        return res.status(500).json({ message: "Internal Server Error", error });
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
        console.log("Fetching order details for Order ID:", orderId, " and Rider ID:", riderId);

        // Fetch order details along with product details
        const order = await NormalOrder.findOne({
            where: { id: orderId, rid: riderId },
            include: [
                {
                    model: NormalOrderProduct,
                    as: "orderProducts",
                    include: [
                        {
                            model: Product,
                            as: "productDetails",
                            attributes: ["id", "title", "description", "normal_price", "mrp_price", "img"],
                        }
                    ]
                }
            ]
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
            Data: order
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


module.exports = { FetchAllInstantDeliveryOrders,ViewOrderDetails };
