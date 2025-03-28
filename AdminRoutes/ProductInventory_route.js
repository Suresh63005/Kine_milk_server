const express = require('express');
const ProductInventory = require('../AdminControllers/ProductInventory_controller');
const upload = require('../utils/multerConfig');

const router = express.Router();



router.post("/upsert",ProductInventory.upsertInventory);

router.post("/upsert-productinv",upload.none(),ProductInventory.upsertInventory);
router.get("/getproductinv/:id",ProductInventory.getProductInventoryById);
router.get("/getallproductinv",ProductInventory.ProductInventoryList)
router.patch("/toggle-status/",ProductInventory.toggleProductInventoryStatus)
router.delete("/delete/:id",ProductInventory.deleteProductInventory)
router.get("/getproductbystore/:store_id",ProductInventory.getProductsbyStore)

module.exports = router;