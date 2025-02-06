const express = require('express');
const router = express.Router();
const productController = require('../../UserControllers/Store/store_product_controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.get("/fetch-all",authMiddleware.isAuthenticated,productController.AllProducts);
router.get("/view-product/:productId",authMiddleware.isAuthenticated,productController.ViewSingleProduct);
router.get("/cat-product/:categoryId",authMiddleware.isAuthenticated,productController.GetProductsByCategory);
router.post("/search-product",authMiddleware.isAuthenticated,productController.SearchProductByTitle);

module.exports = router;