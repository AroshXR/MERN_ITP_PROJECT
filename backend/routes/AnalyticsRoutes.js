const express = require('express');
const router = express.Router();
const { getOverview, getStock } = require('../controllers/AnalyticsController');

router.get('/overview', getOverview);
router.get('/stock', getStock);

module.exports = router;


