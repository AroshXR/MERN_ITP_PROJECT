const mongoose = require('mongoose');

const MeasurementSchema = new mongoose.Schema(
  {
    chest: Number,
    waist: Number,
    hip: Number,
    sleeve: Number,
    length: Number,
  },
  { _id: false }
);

const ConfigSchema = new mongoose.Schema(
  {
    clothingType: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 1 },
    notes: { type: String },
  },
  { _id: false }
);

const DesignSchema = new mongoose.Schema(
  {
    // Primary preview image for the design (e.g., composite/mockup)
    designImageUrl: { type: String },
    // Raw selected design metadata from the customizer
    selectedDesign: { type: Object },
    // Placed designs on the garment with positions/scale/rotation/side
    placedDesigns: [
      new mongoose.Schema(
        {
          url: String,
          x: Number,
          y: Number,
          scale: Number,
          rotation: Number,
          side: { type: String, enum: ['front', 'back', 'left', 'right'], default: 'front' },
          preview: String,
        },
        { _id: false }
      ),
    ],
    // Backwards-compatible field for any custom metadata
    designMeta: { type: Object },
  },
  { _id: false }
);

const CustomOrderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    config: { type: ConfigSchema, required: true },
    design: { type: DesignSchema },
    measurements: { type: MeasurementSchema },
    status: {
      type: String,
      enum: ['pending','assigned','accepted','in_progress','completed','delivered','cancelled'],
      default: 'pending',
      index: true,
    },
    assignedTailor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tailor', index: true },
    assignedAt: { type: Date },
    previewGallery: [{ type: String }],
    price: { type: Number },
    payoutAmount: { type: Number },
    paidOutAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomOrder', CustomOrderSchema);
