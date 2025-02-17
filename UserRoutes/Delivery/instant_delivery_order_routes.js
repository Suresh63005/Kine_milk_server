const express = require('express');
const router = express.Router();
const instantOrdersController = require('../../UserControllers/Delivery/instant_delivery_orders_controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get("/instant-orders",authMiddleware.isAuthenticated,instantOrdersController.FetchAllInstantDeliveryOrders)
router.get("/view-orderDetails",authMiddleware.isAuthenticated,instantOrdersController.ViewOrderDetails)

module.exports = router