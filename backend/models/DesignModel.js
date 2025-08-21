// models/Design.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DesignSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clothingType: {
    type: String,
    default: "tshirt"
  },
  color: {
    type: String,
    required: true
  },
  presetDesign: {
    id: Number,
    name: String,
    price: Number,
    preview: String
  },
  customDesign: {
    imageUrl: String,
    price: { type: Number, default: 25 }
  },
  tshirtSize: {
    type: String,
    enum: ['S', 'M', 'L', 'XL', 'XXL']
  },
  sizePrice: {
    type: Number,
    default: 0
  },
  designSize: {
    type: Number,
    default: 80
  },
  designPosition: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  quantity: {
    type: Number,
    default: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  placedDesigns: [{
    id: String,
    name: String,
    price: Number,
    preview: String,
    side: String,
    position: {
      x: Number,
      y: Number
    },
    size: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DesignModel', DesignSchema);