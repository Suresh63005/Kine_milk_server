const express  = require('express');
const {subscribeOrder, getOrdersByStatus, getOrderDetails, cancelOrder} = require('../../UserControllers/customer/subscribeOrder_controller');


const router = express.Router();

router.post("/",subscribeOrder);
router.post("/status",getOrdersByStatus);
router.get("/:id",getOrderDetails);
router.post("/cancel",cancelOrder);

module.exports = router;