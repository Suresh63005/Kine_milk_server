const express = require('express');
const router = express.Router();
const riderAuthController = require('../../UserControllers/Delivery/rider_auth_controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const upload = require('../../utils/multerConfig');

router.post("/verify-rider",riderAuthController.VerifyRiderMobile)
router.put("/edit-profile/:rider_id",authMiddleware.isAuthenticated,upload.single('img'),riderAuthController.EditRiderProfile)
router.delete("/delete-rider-profile", authMiddleware.isAuthenticated,riderAuthController.DeleteRiderProfile);

module.exports = router;