const express = require('express');
const router = express.Router();
const storeInstantOrders = require('../../UserControllers/Store/store_instant_orders_controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get("/all/:storeId",authMiddleware.isAuthenticated,storeInstantOrders.ListAllInstantOrders);
router.post("/assign-order",storeInstantOrders.AssignOrderToRider);
router.post("/order-status",authMiddleware.isAuthenticated,storeInstantOrders.FetchAllInstantOrdersByStatus);
router.post("/view-order",authMiddleware.isAuthenticated,storeInstantOrders.ViewInstantOrderById);

module.exports = router;