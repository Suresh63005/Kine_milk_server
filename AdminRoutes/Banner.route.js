<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const upload = require('../utils/multerConfig');
const bannerController = require('../AdminControllers/Banner.Controller');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post("/upsert-banner",upload.single('img'), bannerController.upsertBanner);
router.get("/fetch-banners", bannerController.fetchBanners);
router.patch("/toggle-status",bannerController.toggleBannerStatus);

router.get("/getbannerbyid/:id",bannerController.fetchbannerbyid),
router.delete("/deletebannerbyid/:id",bannerController.deletebannerbyid),


=======
const express = require('express');
const router = express.Router();
const upload = require('../utils/multerConfig');
const bannerController = require('../AdminControllers/Banner.Controller');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post("/upsert-banner",upload.single('img'), bannerController.upsertBanner);
router.get("/fetch-banners", adminMiddleware.isAdmin,bannerController.fetchBanners);

router.get("/getbannerbyid/:id", adminMiddleware.isAdmin, bannerController.fetchbannerbyid);

router.patch("/toggle-status",bannerController.toggleBannerStatus);


router.delete("/deletebannerbyid/:id",bannerController.deletebannerbyid),


>>>>>>> 85d8b8550aeb34ff8be1dd7f1115cd3f5dd1862e
module.exports = router;