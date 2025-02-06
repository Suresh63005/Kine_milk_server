const express = require('express');
const router = express.Router();
const instantOrdersController = require('../../UserControllers/Store/instant_order_history_controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get("/all/:storeId",authMiddleware.isAuthenticated,instantOrdersController.FetchInstantOrders);
router.post("/order-status",authMiddleware.isAuthenticated,instantOrdersController.FetchInstantOrdersByStatus);

module.exports = router;