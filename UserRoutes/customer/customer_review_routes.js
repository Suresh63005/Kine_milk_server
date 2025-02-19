const express = require('express');
const router = express.Router();
const ProductReviewController = require('../../UserControllers/customer/customer_reviews_controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post("/post-review",authMiddleware.isAuthenticated,ProductReviewController.PostProductReview);
router.post("/post-delivery-review",authMiddleware.isAuthenticated,ProductReviewController.PostDeliveryBoyReview);


module.exports = router;