const express = require("express");
const { homeAPI,NotificationsAPI } = require("../../UserControllers/customer/home_date_controller");

const router = express.Router();

router.get("/:pincode",homeAPI);

module.exports = router;