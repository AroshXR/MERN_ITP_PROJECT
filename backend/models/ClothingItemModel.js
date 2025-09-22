const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clothingItemSchema = new Schema({
  // Core details
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  sku: {
    type: String,
    default: "",
    trim: true
  },
  barcode: {
    type: String,
    default: "",
    trim: true
  },

  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: "USD"
  },
  compareAtPrice: {
    type: Number,
    default: null,
    min: 0
  },
  costPrice: {
    type: Number,
    default: null,
    min: 0
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Media
  imageUrl: {
    type: String,
    default: ""
  },
  imagePlaceholderUrl: {
    type: String,
    default: ""
  },
  gallery: [{
    type: String
  }],

  // Classification
  category: {
    type: String,
    default: ""
  },
  brand: {
    type: String,
    default: ""
  },
  material: {
    type: String,
    default: ""
  },
  tags: [{
    type: String
  }],

  // Options
  sizes: [{
    type: String
  }],
  colors: [{
    type: String
  }],

  // Inventory
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  variants: [{
    size: { type: String, default: null },
    color: { type: String, default: null },
    stock: { type: Number, default: 0, min: 0 },
    priceDelta: { type: Number, default: 0 }
  }],

  // Merchandising & status
  status: {
    type: String,
    enum: ["active", "archived", "draft"],
    default: "active"
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0,
    min: 0
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model(
  "ClothingItem",
  clothingItemSchema
);


