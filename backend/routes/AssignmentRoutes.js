const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrUpdate, list, listMine } = require('../controllers/AssignmentController');

// Simple admin check
const ensureAdmin = (req, res, next) => {
  if (req.user?.type === 'Admin' || req.user?.role === 'admin') return next();
  return res.status(403).json({ status: 'error', message: 'Admin only' });
};

router.use(protect);

// Admin: create/update assignment, list all
router.post('/', ensureAdmin, createOrUpdate);
router.get('/', ensureAdmin, list);

// Tailor: my active assignments
router.get('/mine', listMine);

module.exports = router;
