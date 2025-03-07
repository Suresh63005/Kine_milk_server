const express = require("express");
const router = express.Router();
const deliveryController = require("../../UserControllers/Delivery/order_delivered_controller");
const upload = require("../../utils/multerConfig");
const authMiddleware = require("../../middlewares/authMiddleware");

router.post(
  "/order-delivered",
  authMiddleware.isAuthenticated,
  upload.array("delivery_images", 5),
  deliveryController.OrderDelivered
);

router.post(
  "/subscription-order-delivered",
  authMiddleware.isAuthenticated,
  upload.array("delivery_images",5),
  deliveryController.SubscriptionOrderDelivered
);

module.exports = router;
