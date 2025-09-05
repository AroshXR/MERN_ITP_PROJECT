const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['T-Shirts', 'Hoodies', 'Pants', 'Accessories', 'Shoes', 'Dresses', 'Jackets']
    },
    size: {
        type: [String],
        required: true,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']
    },
    color: {
        type: [String],
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    imageUrl: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    material: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create indexes for better search performance
inventoryItemSchema.index({ name: 'text', description: 'text' });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ price: 1 });
inventoryItemSchema.index({ isActive: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
