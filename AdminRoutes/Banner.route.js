const express = require('express');
const router = express.Router();
const upload = require('../utils/multerConfig');
const bannerController = require('../AdminControllers/Banner.Controller');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post("/upsert-banner",upload.single('img'), bannerController.upsertBanner);
router.get("/fetch-banners", bannerController.fetchBanners);
router.get("/getbannerbyid/:id", bannerController.fetchBannersById);
router.patch("/toggle-status",bannerController.toggleBannerStatus);

router.get("/getbannerbyid/:id",bannerController.fetchbannerbyid),
router.delete("/deletebannerbyid/:id",bannerController.deletebannerbyid),


module.exports = router;