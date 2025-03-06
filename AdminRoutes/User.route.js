const express = require('express');
const router = express.Router();
const upload = require('../utils/multerConfig');
const adminMiddleware = require('../middlewares/adminMiddleware');
const UserController = require("../AdminControllers/User_controller")

router.get("/getusers",UserController.getUsers);
router.patch("/toggle-status",UserController.toggleusertStatus);


module.exports=router