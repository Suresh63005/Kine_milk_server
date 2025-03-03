const express = require('express');

const router = express.Router();

const authMiddleware = require('../../middlewares/authMiddleware');
const { getWallet, updateWallet } = require('../../UserControllers/customer/wallet_controller');

router.get("/",authMiddleware.isAuthenticated,getWallet);
router.post("/",authMiddleware.isAuthenticated,updateWallet);

module.exports = router;


