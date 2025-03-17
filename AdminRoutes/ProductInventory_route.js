const express = require('express');
const { addInventory } = require('../AdminControllers/ProductInventory_controller');

const router = express.Router();


router.post("/upsert",addInventory);


module.exports = router;