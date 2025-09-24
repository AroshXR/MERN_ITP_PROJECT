const mongoose = require('mongoose');

const materialInventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    default: 'pieces'
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalValue: {
    type: Number,
    required: true,
    min: 0
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupplierOrder',
    required: true
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  location: {
    type: String,
    trim: true,
    default: 'Main Warehouse'
  },
  minimumStock: {
    type: Number,
    min: 0,
    default: 10
  },
  status: {
    type: String,
    enum: ['available', 'low_stock', 'out_of_stock'],
    default: 'available'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update status based on quantity and minimum stock
materialInventorySchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  this.totalValue = this.quantity * this.unitPrice;
  
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.minimumStock) {
    this.status = 'low_stock';
  } else {
    this.status = 'available';
  }
  
  next();
});

// Index for efficient queries
materialInventorySchema.index({ itemName: 1 });
materialInventorySchema.index({ supplierId: 1 });
materialInventorySchema.index({ status: 1 });

module.exports = mongoose.model('MaterialInventory', materialInventorySchema);
