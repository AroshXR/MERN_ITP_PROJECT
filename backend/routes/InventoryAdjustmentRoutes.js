const express = require('express');
const router = express.Router();
const controller = require('../controllers/InventoryAdjustmentController');

// Create a pending inventory adjustment for an outlet payment
// POST /inventory/adjustments
router.post('/adjustments', controller.createPending);

// Apply an inventory adjustment by paymentId (idempotent)
// POST /inventory/adjustments/apply
router.post('/adjustments/apply', controller.applyByPayment);

module.exports = router;
