const mongoose = require('mongoose');

const TailorAssignmentSchema = new mongoose.Schema({
  clothCustomizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClothCustomizer', required: true, index: true },
  tailorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor', required: true, index: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
}, { timestamps: true });

TailorAssignmentSchema.index({ clothCustomizerId: 1 }, { unique: true }); // one active assignment per order

module.exports = mongoose.model('TailorAssignment', TailorAssignmentSchema);
