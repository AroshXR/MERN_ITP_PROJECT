const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { registerTailor, getMyTailorProfile, listTailors, syncTailorsFromUsers } = require('../controllers/TailorController');

// Simple admin check middleware
const ensureAdmin = (req, res, next) => {
  if (req.user?.type === 'Admin' || req.user?.role === 'admin') return next();
  return res.status(403).json({ status: 'error', message: 'Admin only' });
};

// Tailor self registration / update
router.post('/register', protect, registerTailor);

// Tailor profile
router.get('/me', protect, getMyTailorProfile);

// Admin: list tailors
router.get('/', protect, ensureAdmin, listTailors);

// Admin: sync Tailors from Users(type='Tailor')
router.post('/sync', protect, ensureAdmin, syncTailorsFromUsers);

module.exports = router;
