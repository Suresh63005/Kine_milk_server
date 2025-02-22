const express = require("express");
const { upSertAddress, getAddress } = require("../../UserControllers/customer/address_controller");

const { isAuthenticated } = require("../../middlewares/authMiddleware");

const router = express.Router();

router.post("/",isAuthenticated,upSertAddress);
router.get("/",isAuthenticated,getAddress);


module.exports = router;