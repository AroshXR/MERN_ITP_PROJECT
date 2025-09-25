const express = require('express');
const router = express.Router();
const {
  getOverviewAnalytics,
  getStockAnalytics,
  getRecentOrders,
  getRecentApplications
} = require('../controllers/AnalyticsController');

// Get overview analytics
router.get('/overview', getOverviewAnalytics);

// Get stock analytics
router.get('/stock', getStockAnalytics);

// Get recent orders
router.get('/orders', getRecentOrders);

// Get recent applications
router.get('/applications', getRecentApplications);

module.exports = router;
