const express  = require('express');
const {subscribeOrder, getOrdersByStatus, getOrderDetails, cancelOrder} = require('../../UserControllers/customer/subscribeOrder_controller');
const authMiddleware = require('../../middlewares/authMiddleware');



const router = express.Router();

router.post("/",authMiddleware.isAuthenticated, subscribeOrder);
router.post("/status",authMiddleware.isAuthenticated,getOrdersByStatus);
router.get("/:id",authMiddleware.isAuthenticated,getOrderDetails);
router.post("/cancel",authMiddleware.isAuthenticated,cancelOrder);

module.exports = router;