const express = require('express');
const router = express.Router();
const storeUserControllers = require('../../UserControllers/Store/store_user_controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const upload = require('../../utils/multerConfig');

router.get("/profile",authMiddleware.isAuthenticated,storeUserControllers.StoreProfile);
router.patch("/edit-profile/:storeId",authMiddleware.isAuthenticated,upload.single('rimg'),storeUserControllers.EditStoreProfile);

module.exports = router;