const express = require('express');
const router = express.Router();
const storeController = require('../AdminControllers/Store.Controller');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../utils/multerConfig');

router.post("/upsert",upload.fields([
    {name:"rimg",maxCount:1},
    {name:"cover_img",maxCount:1}
]),storeController.upsertStore);
router.get("/fetch",storeController.fetchStores);
router.get("/fetch/:id",storeController.fetchStoreById);
router.delete("/delete/:id",storeController.deleteStore);
router.patch("/toggle-status",storeController.toggleStoreStatus)

module.exports = router;