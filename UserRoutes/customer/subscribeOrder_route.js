const express  = require('express');
const subscribeOrder = require('../../UserControllers/customer/subscribeOrder_controller');

const router = express.Router();

router.post("/",subscribeOrder);

module.exports = router;