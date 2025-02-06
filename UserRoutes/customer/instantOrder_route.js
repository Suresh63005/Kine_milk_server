const express = require('express');
const {instantOrder, getOrdersByStatus, getOrderDetails, cancelOrder} = require('../../UserControllers/customer/instantOrder_controller');


const router = express.Router();

router.post("/",instantOrder);
router.post("/status",getOrdersByStatus);
router.get("/:id",getOrderDetails);
router.post("/",cancelOrder);

module.exports = router ;