const Product = require("../../Models/Product");
const { Op } = require("sequelize");
const asyncHandler = require("../../middlewares/errorHandler");
const logger = require("../../utils/logger");
const uploadToS3 = require("../../config/fileUpload.aws");
const Store = require("../../Models/Store");
const NormalOrder = require("../../Models/NormalOrder");

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


module.exports = {ListAllInstantOrders}