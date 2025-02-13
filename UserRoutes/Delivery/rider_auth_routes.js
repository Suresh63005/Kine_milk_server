const express = require('express');
const router = express.Router();
const riderAuthController = require('../../UserControllers/Delivery/rider_auth_controller');

router.post("/verify-rider",riderAuthController.VerifyRiderMobile)

module.exports = router;