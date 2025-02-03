const express = require('express');
const router = express.Router();
const storeController = require('../AdminControllers/Store.Controller');
const adminMiddleware = require('../middlewares/adminMiddleware');
const upload = require('../utils/multerConfig');

router.post("/upsert",adminMiddleware.authMiddleware,upload.fields([
    {name:"store_logo",maxCount:1},
    {name:"store_cover_image",maxCount:1}
]),storeController.upsertStore);
router.get("/fetch",adminMiddleware.authMiddleware,storeController.fetchStores);
router.get("/fetch/:id",adminMiddleware.authMiddleware,storeController.fetchStoresById);
router.delete("/delete/:id",adminMiddleware.authMiddleware,storeController.deleteStore);

module.exports = router;