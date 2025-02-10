const express = require("express");
const productInfo = require("../../UserControllers/Customer/product_info_controller");


const router = express.Router();

router.post("/info",productInfo);


module.exports = router;