const express = require('express');
const { upsertCart, getCartByUser } = require('../../UserControllers/customer/cart_controller');
const { isAuthenticated } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post("/",upsertCart);
router.get("/:orderType",isAuthenticated, getCartByUser);

module.exports = router;