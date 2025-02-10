const express = require('express');
const { upsertCart, getCartByUser } = require('../../UserControllers/Customer/cart_controller');

const router = express.Router();

router.post("/",upsertCart);
router.get("/", getCartByUser);

module.exports = router;