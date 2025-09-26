const Supplier = require('../models/SupplierModel');
const SupplierOrder = require('../models/SupplierOrderModel');
const MaterialInventory = require('../models/MaterialInventoryModel');

// Helper function to parse items string and add to inventory
const addItemsToInventory = async (order) => {
  try {
    // Parse items string (assuming format: "Item1 x10, Item2 x5, Item3 x20")
    const itemsString = order.items;
    const itemsArray = itemsString.split(',').map(item => item.trim());
    
    const inventoryItems = [];
    
    for (const itemString of itemsArray) {
      // Extract item name and quantity using regex
      const match = itemString.match(/^(.+?)\s*x(\d+)$/i);
      
      if (match) {
        const itemName = match[1].trim();
        const quantity = parseInt(match[2]);
        const unitPrice = order.total / itemsArray.length / quantity; // Estimate unit price
        
        // Check if item already exists in inventory
        let existingItem = await MaterialInventory.findOne({ 
          itemName: itemName,
          supplierId: order.supplierId 
        });
        
        if (existingItem) {
          // Update existing item quantity
          existingItem.quantity += quantity;
          existingItem.totalValue = existingItem.quantity * existingItem.unitPrice;
          existingItem.lastUpdated = new Date();
          await existingItem.save();
          inventoryItems.push(existingItem);
        } else {
          // Create new inventory item
          const newInventoryItem = new MaterialInventory({
            itemName: itemName,
            quantity: quantity,
            unitPrice: unitPrice,
            totalValue: quantity * unitPrice,
            supplierId: order.supplierId,
            supplierName: order.supplierName,
            orderId: order._id,
            description: `Added from order #${order._id}`,
            category: 'Materials',
            unit: 'pieces'
          });
          
          const savedItem = await newInventoryItem.save();
          inventoryItems.push(savedItem);
        }
      } else {
        // If format doesn't match, create with quantity 1
        const unitPrice = order.total / itemsArray.length;
        
        let existingItem = await MaterialInventory.findOne({ 
          itemName: itemString,
          supplierId: order.supplierId 
        });
        
        if (existingItem) {
          existingItem.quantity += 1;
          existingItem.totalValue = existingItem.quantity * existingItem.unitPrice;
          existingItem.lastUpdated = new Date();
          await existingItem.save();
          inventoryItems.push(existingItem);
        } else {
          const newInventoryItem = new MaterialInventory({
            itemName: itemString,
            quantity: 1,
            unitPrice: unitPrice,
            totalValue: unitPrice,
            supplierId: order.supplierId,
            supplierName: order.supplierName,
            orderId: order._id,
            description: `Added from order #${order._id}`,
            category: 'Materials',
            unit: 'pieces'
          });
          
          const savedItem = await newInventoryItem.save();
          inventoryItems.push(savedItem);
        }
      }
    }
    
    console.log(`Added ${inventoryItems.length} items to inventory from order ${order._id}`);
    return inventoryItems;
  } catch (error) {
    console.error('Error adding items to inventory:', error);
    throw error;
  }
};

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    console.log('Fetching all suppliers');
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    console.log('Found suppliers:', suppliers.length);
    
    // Automatically calculate and update order counts for each supplier
    const suppliersWithOrderCounts = await Promise.all(
      suppliers.map(async (supplier) => {
        // Count orders for this supplier
        const orderCount = await SupplierOrder.countDocuments({ supplierId: supplier._id });
        
        // Find the most recent order date
        const latestOrder = await SupplierOrder.findOne({ supplierId: supplier._id })
          .sort({ orderDate: -1 })
          .select('orderDate');
        
        const lastOrderDate = latestOrder ? latestOrder.orderDate : 'Never';
        
        // Return supplier with updated counts (without saving to database)
        return {
          ...supplier.toObject(),
          totalOrders: orderCount,
          lastOrder: lastOrderDate
        };
      })
    );
    
    res.status(200).json(suppliersWithOrderCounts);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
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
    console.log('Creating supplier with data:', req.body);
    
    // Handle empty registration number
    if (req.body.companyDetails && !req.body.companyDetails.registrationNumber) {
      delete req.body.companyDetails.registrationNumber;
    }
    
    const supplier = new Supplier(req.body);
    console.log('Supplier model created:', supplier);
    const savedSupplier = await supplier.save();
    console.log('Supplier saved successfully:', savedSupplier);
    res.status(201).json(savedSupplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
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
    // Get the current order to check status change
    const currentOrder = await SupplierOrder.findById(req.params.id);
    if (!currentOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = await SupplierOrder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // If status changed to 'completed', add items to inventory
    if (currentOrder.status !== 'completed' && req.body.status === 'completed') {
      try {
        const inventoryItems = await addItemsToInventory(order);
        console.log(`Order ${order._id} completed. Added ${inventoryItems.length} items to inventory.`);
        
        return res.status(200).json({
          order,
          message: `Order completed successfully. ${inventoryItems.length} items added to inventory.`,
          inventoryItems
        });
      } catch (inventoryError) {
        console.error('Error adding items to inventory:', inventoryError);
        // Still return the updated order even if inventory update fails
        return res.status(200).json({
          order,
          warning: 'Order updated but failed to add items to inventory',
          error: inventoryError.message
        });
      }
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

// Fix supplier order counts - recalculate totalOrders for all suppliers
exports.fixSupplierOrderCounts = async (req, res) => {
  try {
    console.log('Starting supplier order count fix...');
    
    // Get all suppliers
    const suppliers = await Supplier.find();
    console.log(`Found ${suppliers.length} suppliers to update`);
    
    let updatedCount = 0;
    
    for (const supplier of suppliers) {
      // Count orders for this supplier
      const orderCount = await SupplierOrder.countDocuments({ supplierId: supplier._id });
      
      // Find the most recent order date
      const latestOrder = await SupplierOrder.findOne({ supplierId: supplier._id })
        .sort({ orderDate: -1 })
        .select('orderDate');
      
      const lastOrderDate = latestOrder ? latestOrder.orderDate : 'Never';
      
      // Update supplier if values are different
      if (supplier.totalOrders !== orderCount || supplier.lastOrder !== lastOrderDate) {
        supplier.totalOrders = orderCount;
        supplier.lastOrder = lastOrderDate;
        await supplier.save();
        updatedCount++;
        
        console.log(`Updated supplier ${supplier.name}: ${orderCount} orders, last order: ${lastOrderDate}`);
      }
    }
    
    console.log(`Fix completed. Updated ${updatedCount} suppliers.`);
    
    res.status(200).json({
      message: 'Supplier order counts fixed successfully',
      totalSuppliers: suppliers.length,
      updatedSuppliers: updatedCount,
      details: suppliers.map(s => ({
        name: s.name,
        totalOrders: s.totalOrders,
        lastOrder: s.lastOrder
      }))
    });
  } catch (error) {
    console.error('Error fixing supplier order counts:', error);
    res.status(500).json({ message: 'Error fixing supplier order counts', error: error.message });
  }
};
