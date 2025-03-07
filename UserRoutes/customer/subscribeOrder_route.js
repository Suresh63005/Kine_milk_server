const express  = require('express');
const {subscribeOrder, getOrdersByStatus} = require('../../UserControllers/customer/subscribeOrder_controller');

const router = express.Router();

router.post("/",subscribeOrder);
router.post("/status",getOrdersByStatus);

module.exports = router;