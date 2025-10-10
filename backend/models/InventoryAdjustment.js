const mongoose = require("mongoose");

const InventoryAdjustmentItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClothingItem",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: false }
);

const InventoryAdjustmentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: [true, "paymentId is required"],
      index: true,
      trim: true,
    },
    source: {
      type: String,
      enum: ["outlet"],
      default: "outlet",
      required: true,
      index: true,
    },
    items: {
      type: [InventoryAdjustmentItemSchema],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "items array must contain at least 1 entry",
      },
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "applied", "failed"],
      default: "pending",
      required: true,
      index: true,
    },
    appliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One adjustment per payment for idempotency
InventoryAdjustmentSchema.index({ paymentId: 1 }, { unique: true });

module.exports = mongoose.model("InventoryAdjustment", InventoryAdjustmentSchema);
