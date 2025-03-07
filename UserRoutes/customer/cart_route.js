const express = require('express');
const { upsertCart, getCartByUser } = require('../../UserControllers/customer/cart_controller');

const router = express.Router();

router.post("/",upsertCart);
router.get("/", getCartByUser);

module.exports = router;