const express = require('express');
const router = express.Router();
const stockController = require('../AdminControllers/stockController');

router.get('/stock-reports', stockController.getStockReports);
router.get('/stock-reports/download', stockController.downloadAllStockReports);
router.get('/stock-reports/download/:storeId', stockController.downloadSingleStoreStockReport);

module.exports = router;
