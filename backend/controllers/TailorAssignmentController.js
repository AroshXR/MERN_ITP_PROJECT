const ClothCustomizer = require('../models/ClothCustomizerModel');
const User = require('../models/User'); // Fixed import path

// Get all available tailors
const getAvailableTailors = async (req, res) => {
    try {
        const tailors = await User.find({ type: 'Tailor' })
            .select('_id username email name')
            .sort({ name: 1 });

        res.json({
            status: 'success',
            data: tailors
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch tailors',
            error: err.message
        });
    }
};

// Assign tailor to order
const assignTailor = async (req, res) => {
    try {
        const { id } = req.params;
        const { tailorId } = req.body;

        if (!tailorId) {
            return res.status(400).json({
                status: 'error',
                message: 'Tailor ID is required'
            });
        }

        // Verify tailor exists and is actually a tailor
        const tailor = await User.findOne({ 
            _id: tailorId, 
            type: 'Tailor'
        });

        if (!tailor) {
            return res.status(404).json({
                status: 'error',
                message: 'Tailor not found'
            });
        }

        // Find and update the order
        const order = await ClothCustomizer.findById(id);
        if (!order) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        order.assignedTailor = tailorId;
        order.status = 'assigned';
        await order.save();

        // Get updated order with populated fields
        const updatedOrder = await ClothCustomizer.findById(id)
            .populate('userId', 'username email')
            .populate('assignedTailor', 'username email name');

        res.json({
            status: 'success',
            message: 'Tailor assigned successfully',
            data: updatedOrder
        });
    } catch (err) {
        console.error('Assign tailor error:', err);
        res.status(500).json({
            status: 'error',
            message: 'Failed to assign tailor',
            error: err.message
        });
    }
};

// Get orders assigned to a specific tailor
const getTailorAssignments = async (req, res) => {
    try {
        const tailorId = req.params.tailorId;
        
        const assignments = await ClothCustomizer.find({
            assignedTailor: tailorId
        })
        .populate('userId', 'username email')
        .sort({ createdAt: -1 });

        res.json({
            status: 'success',
            data: assignments
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch assignments',
            error: err.message
        });
    }
};

module.exports = {
    getAvailableTailors,
    assignTailor,
    getTailorAssignments
};