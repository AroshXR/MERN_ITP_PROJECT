const Supplier = require('../models/SupplierModel');
const SupplierOrder = require('../models/SupplierOrderModel');

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
  }
};

// Get single supplier
exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supplier', error: error.message });
  }
};

// Create new supplier
exports.createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    const savedSupplier = await supplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    res.status(400).json({ message: 'Error creating supplier', error: error.message });
  }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(400).json({ message: 'Error updating supplier', error: error.message });
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    // Also delete all orders associated with this supplier
    await SupplierOrder.deleteMany({ supplierId: req.params.id });
    
    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier', error: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await SupplierOrder.find().populate('supplierId').sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await SupplierOrder.findById(req.params.id).populate('supplierId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const order = new SupplierOrder(req.body);
    const savedOrder = await order.save();
    
    // Update supplier's total orders and last order date
    const supplier = await Supplier.findById(req.body.supplierId);
    if (supplier) {
      supplier.totalOrders += 1;
      supplier.lastOrder = req.body.orderDate;
      await supplier.save();
    }
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  try {
    const order = await SupplierOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error: error.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await SupplierOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update supplier's total orders count
    const supplier = await Supplier.findById(order.supplierId);
    if (supplier && supplier.totalOrders > 0) {
      supplier.totalOrders -= 1;
      await supplier.save();
    }
    
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalSuppliers = await Supplier.countDocuments();
    const activeSuppliers = await Supplier.countDocuments({ status: 'active' });
    const totalOrders = await SupplierOrder.countDocuments();
    const pendingOrders = await SupplierOrder.countDocuments({ status: 'pending' });
    
    const orders = await SupplierOrder.find();
    const totalValue = orders.reduce((sum, order) => sum + order.total, 0);
    
    res.status(200).json({
      totalSuppliers,
      activeSuppliers,
      totalOrders,
      pendingOrders,
      totalValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};
