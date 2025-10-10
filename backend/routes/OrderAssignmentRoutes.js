const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { assign, updateStatus, listAdmin, listMine, getOne, listByTailor, listByOrder } = require('../controllers/OrderAssignmentController');

// Simple admin check middleware
const ensureAdmin = (req, res, next) => {
  if (req.user?.type === 'Admin' || req.user?.role === 'admin') return next();
  return res.status(403).json({ status: 'error', message: 'Admin only' });
};

// Admin: assign an order (from either source) to a tailor
router.post('/assign', protect, assign);

// Admin: list assignments (with optional filters)
router.get('/', protect, ensureAdmin, listAdmin);

// Admin: list assignments grouped by tailor (includes ClothCustomizer data per assignment)
router.get('/by-tailor', protect, ensureAdmin, listByTailor);

// Admin: get single assignment by order (source + id)
router.get('/by-order', protect, ensureAdmin, listByOrder);

// Tailor: list my assignments with populated order
router.get('/mine', protect, listMine);

// Tailor/Admin: update assignment status
router.patch('/:id/status', protect, updateStatus);

// Tailor/Admin: get one assignment with populated order
router.get('/:id', protect, getOne);

module.exports = router;
