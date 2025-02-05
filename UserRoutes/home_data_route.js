const express = require("express");
const { homeAPI } = require("../UserControllers/Customer/home_date_controller");

const router = express.Router();

router.get("/",homeAPI);


module.exports = router;