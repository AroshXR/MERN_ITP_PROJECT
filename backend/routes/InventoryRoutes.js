const express = require('express');
const router = express.Router();
const {
    getAllItems,
    getAllItemsAdmin,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    updateStock
} = require('../controllers/InventoryController');

// Public routes (for customers)
router.get('/', getAllItems); // Get all active items with filters
router.get('/:id', getItemById); // Get single item by ID

// Admin routes (protected)
router.get('/admin/all', getAllItemsAdmin); // Get all items including inactive
router.post('/admin', createItem); // Create new item
router.put('/admin/:id', updateItem); // Update item
router.delete('/admin/:id', deleteItem); // Delete item (soft delete)
router.put('/admin/:id/stock', updateStock); // Update stock

module.exports = router;
