const express  = require('express');
const {subscribeOrder, getOrdersByStatus, getOrderDetails, cancelOrder,PauseSubscriptionOrder,AutoResumeSubscriptionOrder, EditSubscriptionOrder} = require('../../UserControllers/customer/subscribeOrder_controller');
const authMiddleware = require('../../middlewares/authMiddleware');



const router = express.Router();

router.post("/",authMiddleware.isAuthenticated, subscribeOrder);
router.patch("/edit",authMiddleware.isAuthenticated,EditSubscriptionOrder);
router.post("/status",authMiddleware.isAuthenticated,getOrdersByStatus);
router.get("/:id",authMiddleware.isAuthenticated,getOrderDetails);
router.post("/cancel",authMiddleware.isAuthenticated,cancelOrder);
router.put("/pause-order",authMiddleware.isAuthenticated,PauseSubscriptionOrder);
router.put("/resume-order",authMiddleware.isAuthenticated,AutoResumeSubscriptionOrder);

module.exports = router;