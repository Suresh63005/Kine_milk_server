const express = require('express');
const router = express.Router();
const orderController = require('../AdminControllers/OrderController');

router.get('/normal-orders', orderController.getNormalOrders);
router.get('/normal-orders/download', orderController.downloadNormalOrders);
router.get('/normal-orders/download/:orderId', orderController.downloadSingleNormalOrder);
router.get('/subscribe-orders', orderController.getSubscribeOrders);
router.get('/subscribe-orders/download', orderController.downloadSubscribeOrders);

module.exports = router;