const MaterialInventory = require('../models/MaterialInventoryModel');
const Supplier = require('../models/SupplierModel');

// Get all inventory items
exports.getAllInventoryItems = async (req, res) => {
  try {
    const { status, supplierId, category, search } = req.query;
    let query = {};
    
    // Apply filters
    if (status) query.status = status;
    if (supplierId) query.supplierId = supplierId;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const items = await MaterialInventory.find(query)
      .populate('supplierId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory items', error: error.message });
  }
};

// Get single inventory item
exports.getInventoryItem = async (req, res) => {
  try {
    const item = await MaterialInventory.findById(req.params.id)
      .populate('supplierId', 'name email contactInfo')
      .populate('orderId');
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory item', error: error.message });
  }
};

// Create new inventory item (manual entry)
exports.createInventoryItem = async (req, res) => {
  try {
    const item = new MaterialInventory(req.body);
    const savedItem = await item.save();
    
    const populatedItem = await MaterialInventory.findById(savedItem._id)
      .populate('supplierId', 'name email');
    
    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating inventory item', error: error.message });
  }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const item = await MaterialInventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplierId', 'name email');
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.status(200).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Error updating inventory item', error: error.message });
  }
};

// Delete inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await MaterialInventory.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting inventory item', error: error.message });
  }
};

// Update item quantity (for stock adjustments)
exports.updateItemQuantity = async (req, res) => {
  try {
    const { quantity, reason } = req.body;
    
    if (quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }
    
    const item = await MaterialInventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    const oldQuantity = item.quantity;
    item.quantity = quantity;
    item.description = `${item.description || ''} | Quantity adjusted from ${oldQuantity} to ${quantity}. Reason: ${reason || 'Manual adjustment'}`;
    
    const updatedItem = await item.save();
    
    res.status(200).json({
      item: updatedItem,
      message: `Quantity updated from ${oldQuantity} to ${quantity}`
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating quantity', error: error.message });
  }
};

// Get inventory dashboard stats
exports.getInventoryStats = async (req, res) => {
  try {
    const totalItems = await MaterialInventory.countDocuments();
    const availableItems = await MaterialInventory.countDocuments({ status: 'available' });
    const lowStockItems = await MaterialInventory.countDocuments({ status: 'low_stock' });
    const outOfStockItems = await MaterialInventory.countDocuments({ status: 'out_of_stock' });
    
    // Calculate total inventory value
    const items = await MaterialInventory.find();
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    
    // Get items by category
    const categoryStats = await MaterialInventory.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]);
    
    // Get low stock alerts
    const lowStockAlerts = await MaterialInventory.find({ 
      status: { $in: ['low_stock', 'out_of_stock'] } 
    }).select('itemName quantity minimumStock status');
    
    res.status(200).json({
      totalItems,
      availableItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      categoryStats,
      lowStockAlerts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory stats', error: error.message });
  }
};

// Get items by supplier
exports.getItemsBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    
    const items = await MaterialInventory.find({ supplierId })
      .populate('supplierId', 'name email')
      .sort({ itemName: 1 });
    
    if (items.length === 0) {
      return res.status(404).json({ message: 'No items found for this supplier' });
    }
    
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items by supplier', error: error.message });
  }
};

// Search inventory items
exports.searchInventoryItems = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const items = await MaterialInventory.find({
      $or: [
        { itemName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { supplierName: { $regex: query, $options: 'i' } }
      ]
    }).populate('supplierId', 'name email').limit(20);
    
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error searching inventory items', error: error.message });
  }
};
