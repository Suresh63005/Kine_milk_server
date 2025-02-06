const express = require("express");
const { upSertAddress, getAddress } = require("../../UserControllers/customer/address_controller");

const router = express.Router();

router.post("/",upSertAddress);
router.get("/",getAddress);


module.exports = router;