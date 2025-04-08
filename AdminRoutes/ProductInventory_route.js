const express = require('express');
const ProductInventory = require('../AdminControllers/ProductInventory_controller');
const upload = require('../utils/multerConfig');
const adminMiddleware = require("../middlewares/adminMiddleware")
const router = express.Router();



router.post("/upsert",adminMiddleware.isAdmin,ProductInventory.upsertInventory);

router.post("/upsert-productinv",adminMiddleware.isAdmin,upload.none(),ProductInventory.upsertInventory);
router.get("/getproductinv/:id",adminMiddleware.isAdmin,ProductInventory.getProductInventoryById);
router.get("/getallproductinv",adminMiddleware.isAdmin,ProductInventory.ProductInventoryList)
router.patch("/toggle-status/",adminMiddleware.isAdmin,ProductInventory.toggleProductInventoryStatus)
router.delete("/delete/:id",adminMiddleware.isAdmin,ProductInventory.deleteProductInventory)
router.get("/getproductbystore/:store_id",adminMiddleware.isAdmin,ProductInventory.getProductsbyStore)
router.delete("/delete-weight-options",adminMiddleware.isAdmin,ProductInventory.deleteInventoryStoreWeightOptions)

module.exports = router;