const mongoose = require('mongoose');

const OrderStatusSchema = new mongoose.Schema({
  clothCustomizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClothCustomizer', required: true, index: true },
  status: { type: String, required: true, enum: ['pending','assigned','accepted','in_progress','completed','delivered','cancelled'] },
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor' },
  note: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

module.exports = mongoose.model('OrderStatus', OrderStatusSchema);
