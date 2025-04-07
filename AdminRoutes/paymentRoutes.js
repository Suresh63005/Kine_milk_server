const express = require('express');
const router = express.Router();
const paymentController = require('../AdminControllers/paymentController');

// Normal Payment Routes
router.get('/normal-payments', paymentController.getNormalPayments);
router.get('/normal-payments/download', paymentController.downloadNormalPayments);
router.get('/normal-payments/download/:orderId', paymentController.downloadSingleNormalPayment);

// Subscribe Payment Routes
router.get('/subscribe-payments', paymentController.getSubscribePayments);
router.get('/subscribe-payments/download', paymentController.downloadSubscribePayments);
router.get('/subscribe-payments/download/:orderId', paymentController.downloadSingleSubscribePayment);

module.exports = router;