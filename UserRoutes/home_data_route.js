const express = require("express");
const { homeAPI } = require("../UserControllers/home_date_controller");
const router = express.Router();

router.get("/",homeAPI);


module.exports = router;