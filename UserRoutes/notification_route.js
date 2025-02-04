const express = require("express");
const { notification_fn } = require("../UserControllers/notification_controller");

const router = express.Router();

router.post("/",notification_fn);


module.exports = router;