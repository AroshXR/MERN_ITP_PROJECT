const mongoose = require('mongoose');

const TailorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String },
    skills: [{ type: String }],
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    payoutEmail: { type: String },
  },
  { timestamps: true }
);

TailorSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Tailor', TailorSchema);
