const express = require('express');
const router = express.Router();
const riderController = require('../../UserControllers/Store/store_rider_controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const upload = require('../../utils/multerConfig');

router.post("/add-rider",authMiddleware.isAuthenticated,upload.single('img'),riderController.AddRider)
router.patch("/edit-rider/:riderId",authMiddleware.isAuthenticated,upload.single('img'),riderController.EditRider)
router.get("/all/:storeId",authMiddleware.isAuthenticated,riderController.GetStoreRiderById);
router.get("/search-rider",authMiddleware.isAuthenticated,riderController.SearchRiderByTitle)
router.post("/all-riders/:storeId",authMiddleware.isAuthenticated,riderController.GetAllStoreRiders)

module.exports = router;