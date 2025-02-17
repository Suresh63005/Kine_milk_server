const express = require('express');
const router = express.Router();
const subscribeDeliveryOrderController = require('../../UserControllers/Delivery/subscribe_delivery_orders_controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get("/subscribe-orders",authMiddleware.isAuthenticated,subscribeDeliveryOrderController.FetchAllSubscribeOrders)
router.get("/view-orderDetails",authMiddleware.isAuthenticated,subscribeDeliveryOrderController.ViewSubscribeOrderDetails)

module.exports = router
