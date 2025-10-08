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

// Admin
router.get('/', protect, ensureAdmin, async (req, res) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.tailorId) query.assignedTailor = req.query.tailorId;
        if (req.query.unassigned === 'true') query.assignedTailor = { $exists: false };
        if (req.query.id) query._id = req.query.id;

        const orders = await ClothCustomizer.find(query)
            .populate('userId', 'username email')
            .sort({ createdAt: -1 });

        res.json({
            status: 'success',
            data: orders
        });

    } catch (err) {
        console.error('Orders fetch error:', err);
        res.status(500).json({ 
            status: 'error', 
            message: err.message 
        });
    }
});

// Customer
router.post('/', protect, ctrl.createOrder);
router.get('/my', protect, ctrl.listMine);

module.exports = router;
