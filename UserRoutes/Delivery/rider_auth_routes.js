const express = require('express');
const router = express.Router();
const riderAuthController = require('../../UserControllers/Delivery/rider_auth_controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post("/verify-rider",riderAuthController.VerifyRiderMobile)
router.put("/edit-profile/:rider_id",authMiddleware.isAuthenticated,riderAuthController.EditRiderProfile)

module.exports = router;