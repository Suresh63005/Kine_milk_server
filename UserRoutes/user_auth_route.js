const express = require('express');
const router = express.Router();
const userAuthController = require('../UserControllers/user_auth_controller');
const userAuthMiddleware = require('../middlewares/authMiddleware');

router.post("/otpLogin",userAuthController.otpLogin);
router.post("/verifyOtp",userAuthController.verifyOtp);

module.exports = router;