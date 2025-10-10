const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/CustomOrderController');
const ClothCustomizer = require('../models/ClothCustomizerModel');

// Simple admin check middleware
const ensureAdmin = (req, res, next) => {
  if (req.user?.type === 'Admin' || req.user?.role === 'admin') return next();
  return res.status(403).json({ status: 'error', message: 'Admin only' });
};

// Admin: list orders directly from ClothCustomizer (direct access)
router.get('/', protect, ensureAdmin, async (req, res) => {
  try {
    const query = {};
    if (req.query.id) query._id = req.query.id;

    const orders = await ClothCustomizer.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    return res.json({ status: 'success', data: orders });
  } catch (err) {
    console.error('Orders fetch error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// Admin: assign tailor to an order
router.post('/:id/assign', protect, ensureAdmin, ctrl.assignTailor);

// Admin: migrate from ClothCustomizer to CustomOrder (optional seeding)
router.post('/migrate', protect, ensureAdmin, ctrl.migrateFromCustomizer);

// Customer: create and list my custom orders
router.post('/', protect, ctrl.createOrder);
router.get('/my', protect, ctrl.listMine);

// Tailor: list orders assigned to me
router.get('/assigned/me', protect, ctrl.listAssignedToMe);

// Tailor/Admin: update order status
router.patch('/:id/status', protect, ctrl.updateStatus);

// Tailor/Admin/Customer (authorized): get single order
router.get('/:id', protect, ctrl.getOne);

module.exports = router;
