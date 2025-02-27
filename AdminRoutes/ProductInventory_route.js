const express = require('express');
const { addInventory } = require('../AdminControllers/ProductInventory_controller');

const router = express.Router();


router.post("/",addInventory);


module.exports = router;