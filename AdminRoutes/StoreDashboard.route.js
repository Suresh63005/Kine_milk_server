const express = require("express");
const router = express.Router();
const { getStoreDashboardData } = require("../AdminControllers/StoreDashboard.controller");

// Define the dashboard route
router.get("/dashboard/:store_id", getStoreDashboardData);

module.exports = router;
