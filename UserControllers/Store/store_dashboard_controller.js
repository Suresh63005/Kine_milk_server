const Product = require("../../Models/Product");
const NormalOrder = require("../../Models/NormalOrder");
const SubscribeOrder = require("../../Models/SubscribeOrder");
const Rider = require("../../Models/Rider");
const Store = require("../../Models/Store");
const asyncHandler = require("../../middlewares/errorHandler");
const moment = require('moment');
const { Op } = require("sequelize");

const StoreDashboardAPI = asyncHandler(async (req, res) => {
  try {
    const uid = req.user.userId; 

    if (!uid) {
      return res
        .status(400)
        .json({ message: "Unauthorized! user not found." });
    }

    // Find the store associated with the mobile number
    const store = await Store.findOne();

    if (!store) {
      return res.status(404).json({ message: "No store found for this user!" });
    }

    const storeId = store.id;

    const startOfDay=moment().startOf("day").toDate();
    const endOfDay=moment().endOf("day").toDate();

    // Today Summery
    const totalOrders = await NormalOrder.count({
      where: { store_id: storeId, status: "On Route",createdAt: { [Op.between]: [startOfDay, endOfDay] } },
    });
    const openOrders = await NormalOrder.count({
      where: { store_id: storeId, status: "Processing",createdAt: { [Op.between]: [startOfDay, endOfDay] } },
    });
    const closedOrders = await NormalOrder.count({
      where: { store_id: storeId, status: "Completed",createdAt: { [Op.between]: [startOfDay, endOfDay] } },
    });

    const products = await Product.findAll({ where: { store_id: storeId } });
    const deliveryBoys = await Rider.findAll({ where: { store_id: storeId } });
    const instantOrders = await NormalOrder.count({
      where: { store_id: storeId },
    });
    const subscriptionOrders = await SubscribeOrder.count({
      where: { store_id: storeId },
    });

    return res.status(200).json({
      success: true,
      message: "Store dashboard data fetched successfully.",
      store_details: {
        id: store.id,
        title: store.title,
        address: store.full_address,
        mobile: store.mobile,
        status: store.status,
      },
      todays_summary: {
        total_orders: totalOrders,
        open_orders: openOrders,
        closed_orders: closedOrders,
      },
      inventory: {
        products,
        deliveryBoys,
        instantOrders,
        subscriptionOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching store dashboard data:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = { StoreDashboardAPI };
