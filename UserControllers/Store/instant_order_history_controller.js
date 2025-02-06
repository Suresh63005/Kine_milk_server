const NormalOrder = require('../../Models/NormalOrder');
const User = require('../../Models/User'); 
const asyncHandler = require("../../middlewares/errorHandler");

const FetchInstantOrders = asyncHandler(async (req, res) => {
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
    const { storeId } = req.params;
    
    if (!storeId) {
        return res.status(400).json({ message: "Store ID is required." });
    }

    try {
        const normalOrdersHistory = await NormalOrder.findAll({
            where: { store_id: storeId },
            attributes: [
                "id", "odate", "p_method_id", "address_id", "subtotal",
                "trans_id", "status", "o_type"
            ],
            include: [
                {
                    model: User,
                    attributes: ["id", "name", "mobile", "email"],
                    as: "user" 
                }
            ]
        });

        if (normalOrdersHistory.length === 0) {
            return res.status(404).json({ message: "No orders found for this store." });
        }

        return res.status(200).json({
            ResponseCode: "200",
            Result: "true",
            message: "Orders fetched successfully.",
            orders: normalOrdersHistory
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
});

const FetchInstantOrdersByStatus = asyncHandler(async (req, res) => {
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

module.exports = {FetchInstantOrders,FetchInstantOrdersByStatus};
