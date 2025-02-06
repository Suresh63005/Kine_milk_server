const express = require('express');
const router = express.Router();
const storeInstantOrders = require('../../UserControllers/Store/store_instant_orders_controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get("/all/:storeId",authMiddleware.isAuthenticated,storeInstantOrders.ListAllInstantOrders);

module.exports = router;