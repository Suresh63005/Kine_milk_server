const express = require("express");
const { upSertAddress, getAddress } = require("../../UserControllers/Customer/address_controller");

const router = express.Router();

router.post("/",upSertAddress);
router.get("/",getAddress);


module.exports = router;