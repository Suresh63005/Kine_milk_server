const express  = require('express');
const {subscribeOrder, getOrdersByStatus, getOrderDetails, cancelOrder} = require('../../UserControllers/customer/subscribeOrder_controller');
const { isAuthenticated } = require('../../middlewares/authMiddleware');


const router = express.Router();

router.post("/",isAuthenticated, subscribeOrder);
router.post("/status",getOrdersByStatus);
router.get("/:id",getOrderDetails);
router.post("/cancel",cancelOrder);

module.exports = router;