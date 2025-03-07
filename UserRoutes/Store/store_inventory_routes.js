const express = require('express');
const router = express.Router();
const storeInventoryController= require('../../UserControllers/Store/store_inventory_controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get("/all/:storeId",authMiddleware.isAuthenticated,storeInventoryController.ListInventory);
router.patch("/edit/:storeId",authMiddleware.isAuthenticated,storeInventoryController.AddInventory);
router.get("/:productId",authMiddleware.isAuthenticated,storeInventoryController.ViewProductInventoryById);

module.exports = router;