const mongoose = require('mongoose');

const OrderAssignmentSchema = new mongoose.Schema(
  {
    orderSource: { type: String, enum: ['CustomOrder', 'ClothCustomizer'], required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor', required: true, index: true },
    status: { type: String, enum: ['unassigned','assigned','accepted','in_progress','completed','rejected'], default: 'assigned', index: true },
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

OrderAssignmentSchema.index({ orderSource: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('OrderAssignment', OrderAssignmentSchema);
