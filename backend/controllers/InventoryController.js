const MaterialInventory = require('../models/MaterialInventoryModel');
const Supplier = require('../models/SupplierModel');

// Email service - temporarily disabled for testing
let sendLowStockAlert;
try {
  const emailService = require('../services/emailService');
  sendLowStockAlert = emailService.sendLowStockAlert;
} catch (error) {
  console.log('Email service not available:', error.message);
  sendLowStockAlert = async (item) => {
    console.log(`📧 Mock email alert for ${item.itemName} (Email service not configured)`);
    return { success: true, messageId: 'mock-email' };
  };
}

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
    const oldStatus = item.status;
    
    item.quantity = quantity;
    item.description = `${item.description || ''} | Quantity adjusted from ${oldQuantity} to ${quantity}. Reason: ${reason || 'Manual adjustment'}`;
    
    const updatedItem = await item.save();
    
    // Check if item became low stock or out of stock and send email alert
    if (updatedItem.status !== oldStatus && (updatedItem.status === 'low_stock' || updatedItem.status === 'out_of_stock')) {
      try {
        await sendLowStockAlert(updatedItem);
        console.log(`📧 Low stock alert sent for ${updatedItem.itemName}`);
      } catch (emailError) {
        console.error('Failed to send low stock alert:', emailError.message);
      }
    }
    
    res.status(200).json({
      item: updatedItem,
      message: `Quantity updated from ${oldQuantity} to ${quantity}`,
      alertSent: updatedItem.status !== oldStatus && (updatedItem.status === 'low_stock' || updatedItem.status === 'out_of_stock')
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating quantity', error: error.message });
  }
};

// Use item function - decreases quantity when items are used in production
exports.useItem = async (req, res) => {
  try {
    const { quantityUsed, reason, usedBy } = req.body;
    
    if (!quantityUsed || quantityUsed <= 0) {
      return res.status(400).json({ message: 'Quantity used must be a positive number' });
    }
    
    const item = await MaterialInventory.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    if (item.quantity < quantityUsed) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${item.quantity} ${item.unit}, Requested: ${quantityUsed} ${item.unit}` 
      });
    }
    
    const oldQuantity = item.quantity;
    const oldStatus = item.status;
    
    item.quantity -= quantityUsed;
    
    // Add usage log to description
    const usageLog = `Used ${quantityUsed} ${item.unit} on ${new Date().toLocaleDateString()}. Reason: ${reason || 'Production use'}${usedBy ? ` | Used by: ${usedBy}` : ''}`;
    item.description = item.description ? `${item.description} | ${usageLog}` : usageLog;
    
    const updatedItem = await item.save();
    
    // Check if item became low stock or out of stock after usage and send email alert
    if (updatedItem.status !== oldStatus && (updatedItem.status === 'low_stock' || updatedItem.status === 'out_of_stock')) {
      try {
        await sendLowStockAlert(updatedItem);
        console.log(`📧 Low stock alert sent for ${updatedItem.itemName} after usage`);
      } catch (emailError) {
        console.error('Failed to send low stock alert:', emailError.message);
      }
    }
    
    res.status(200).json({
      item: updatedItem,
      message: `Used ${quantityUsed} ${item.unit}. Remaining stock: ${updatedItem.quantity} ${item.unit}`,
      previousQuantity: oldQuantity,
      quantityUsed: quantityUsed,
      remainingStock: updatedItem.quantity,
      statusChanged: updatedItem.status !== oldStatus,
      alertSent: updatedItem.status !== oldStatus && (updatedItem.status === 'low_stock' || updatedItem.status === 'out_of_stock')
    });
  } catch (error) {
    res.status(400).json({ message: 'Error using item', error: error.message });
  }
};

// Check and send low stock alerts for all items
exports.checkLowStockAlerts = async (req, res) => {
  try {
    const lowStockItems = await MaterialInventory.find({ 
      status: { $in: ['low_stock', 'out_of_stock'] } 
    });
    
    if (lowStockItems.length === 0) {
      return res.status(200).json({ 
        message: 'No low stock items found',
        itemsChecked: await MaterialInventory.countDocuments()
      });
    }
    
    const emailResults = [];
    
    for (const item of lowStockItems) {
      try {
        const result = await sendLowStockAlert(item);
        emailResults.push({
          itemName: item.itemName,
          status: item.status,
          emailSent: result.success,
          error: result.error || null
        });
      } catch (error) {
        emailResults.push({
          itemName: item.itemName,
          status: item.status,
          emailSent: false,
          error: error.message
        });
      }
    }
    
    res.status(200).json({
      message: `Processed ${lowStockItems.length} low stock items`,
      lowStockItems: lowStockItems.length,
      emailResults: emailResults,
      successfulEmails: emailResults.filter(r => r.emailSent).length,
      failedEmails: emailResults.filter(r => !r.emailSent).length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking low stock alerts', error: error.message });
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
