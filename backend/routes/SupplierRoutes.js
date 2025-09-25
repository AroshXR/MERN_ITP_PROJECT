const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/SupplierController');

// Dashboard stats
router.get('/dashboard-stats', SupplierController.getDashboardStats);

// Fix supplier order counts
router.post('/fix-supplier-counts', SupplierController.fixSupplierOrderCounts);

// Supplier routes
router.get('/suppliers', SupplierController.getAllSuppliers);
router.get('/suppliers/:id', SupplierController.getSupplier);
router.post('/suppliers', SupplierController.createSupplier);
router.put('/suppliers/:id', SupplierController.updateSupplier);
router.delete('/suppliers/:id', SupplierController.deleteSupplier);

// Order routes
router.get('/orders', SupplierController.getAllOrders);
router.get('/orders/:id', SupplierController.getOrder);
router.post('/orders', SupplierController.createOrder);
router.put('/orders/:id', SupplierController.updateOrder);
router.delete('/orders/:id', SupplierController.deleteOrder);

module.exports = router;
