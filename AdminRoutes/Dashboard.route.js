const express = require("express");
const router = express.Router();
const { getDashboardData } = require("../AdminControllers/Dashboard.controller");

// Define the dashboard route
router.get("/dashboard", getDashboardData);

module.exports = router;
