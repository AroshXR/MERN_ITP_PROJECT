const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/OrderStatusController');

router.use(protect);

// Create status (admin or assigned tailor validated in controller)
router.post('/', ctrl.create);

// List full status history for one order
router.get('/', ctrl.list);

// Latest status for many orders: /latest?ids=comma,separated,ids
router.get('/latest', ctrl.latestForOrders);

module.exports = router;
