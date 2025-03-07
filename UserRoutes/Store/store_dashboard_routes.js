const express = require("express");
const router = express.Router();
const StoreHomeData = require("../../UserControllers/Store/store_dashboard_controller");
const authMiddleware = require("../../middlewares/authMiddleware");

router.get("/store-data", authMiddleware.isAuthenticated, StoreHomeData.StoreDashboardAPI);

module.exports = router;
