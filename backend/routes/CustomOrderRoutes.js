const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/CustomOrderController');

// Simple admin check middleware
const ensureAdmin = (req, res, next) => {
  if (req.user?.type === 'Admin' || req.user?.role === 'admin') return next();
  return res.status(403).json({ status: 'error', message: 'Admin only' });
};

// Customer
router.post('/', protect, ctrl.createOrder);
router.get('/my', protect, ctrl.listMine);

// Admin
router.get('/', protect, ensureAdmin, ctrl.listAll);
router.patch('/:id/assign', protect, ensureAdmin, ctrl.assignTailor);

// Tailor
router.get('/assigned', protect, ctrl.listAssignedToMe);
router.get('/:id', protect, ctrl.getOne);
router.patch('/:id/status', protect, ctrl.updateStatus); // tailor transition

module.exports = router;
