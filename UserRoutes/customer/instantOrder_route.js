const express = require('express');
const {instantOrder, getOrdersByStatus, getOrderDetails, cancelOrder,getRecommendedProducts} = require('../../UserControllers/customer/instantOrder_controller');
const authMiddleware = require('../../middlewares/authMiddleware');



const router = express.Router();

router.post("/", authMiddleware.isAuthenticated, instantOrder);
router.post("/status",authMiddleware.isAuthenticated,getOrdersByStatus);
router.get("/:id",authMiddleware.isAuthenticated,getOrderDetails);

router.post("/cancel",authMiddleware.isAuthenticated,cancelOrder);
router.get("/get-recommendedProducts",authMiddleware.isAuthenticated,getRecommendedProducts)

module.exports = router ;