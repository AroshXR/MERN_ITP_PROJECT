const mongoose = require("mongoose");

const paymentDetailsSchema = new mongoose.Schema({
  // Delivery Details
  deliveryDetails: {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"]
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"]
    },
    address: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"]
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [50, "City name cannot exceed 50 characters"]
    },
    state: {
      type: String,
      required: [true, "Province/State is required"],
      trim: true,
      maxlength: [50, "Province/State cannot exceed 50 characters"]
    },
    zipCode: {
      type: String,
      required: [true, "ZIP code is required"],
      trim: true,
      maxlength: [10, "ZIP code cannot exceed 10 characters"]
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: [50, "Country name cannot exceed 50 characters"]
    }
  },

  // Shipping Details
  shippingDetails: {
    method: {
      type: String,
      required: [true, "Shipping method is required"],
      enum: ["standard", "express", "overnight"],
      default: "standard"
    },
    cost: {
      type: Number,
      required: [true, "Shipping cost is required"],
      min: [0, "Shipping cost cannot be negative"]
    }
  },

  // Payment Details
  paymentDetails: {
    method: {
      type: String,
      required: [true, "Payment method is required"],
      enum: ["card", "paypal", "apple", "google"],
      default: "card"
    },
    cardDetails: {
      cardNumber: {
        type: String,
        trim: true,
        validate: {
          validator: function(v) {
            // Only validate if payment method is card
            if (this.paymentDetails && this.paymentDetails.method === "card") {
              return v && v.length >= 13 && v.length <= 19;
            }
            return true;
          },
          message: "Card number must be between 13-19 digits"
        }
      },
      expiryDate: {
        type: String,
        trim: true,
        validate: {
          validator: function(v) {
            if (this.paymentDetails && this.paymentDetails.method === "card") {
              return v && /^(0[1-9]|1[0-2])\/\d{2}$/.test(v);
            }
            return true;
          },
          message: "Expiry date must be in MM/YY format"
        }
      },
      cvv: {
        type: String,
        trim: true,
        validate: {
          validator: function(v) {
            if (this.paymentDetails && this.paymentDetails.method === "card") {
              return v && /^\d{3,4}$/.test(v);
            }
            return true;
          },
          message: "CVV must be 3-4 digits"
        }
      },
      cardName: {
        type: String,
        trim: true,
        maxlength: [100, "Card name cannot exceed 100 characters"]
      },
      saveCard: {
        type: Boolean,
        default: false
      }
    }
  },

  // Order Details
  orderDetails: {
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"]
    },
    tax: {
      type: Number,
      required: [true, "Tax amount is required"],
      min: [0, "Tax cannot be negative"]
    },
    giftWrap: {
      type: Boolean,
      default: false
    },
    giftWrapFee: {
      type: Number,
      default: 0,
      min: [0, "Gift wrap fee cannot be negative"]
    },
    total: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total cannot be negative"]
    }
  },

  // Additional Options
  giftMessage: {
    type: String,
    trim: true,
    maxlength: [500, "Gift message cannot exceed 500 characters"]
  },

  // Status and Timestamps
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled", "failed"],
    default: "pending"
  },

  // User reference (if available)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Optional since guest checkout is allowed
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
paymentDetailsSchema.index({ "deliveryDetails.email": 1 });
paymentDetailsSchema.index({ "deliveryDetails.phone": 1 });
paymentDetailsSchema.index({ status: 1 });
paymentDetailsSchema.index({ createdAt: -1 });
paymentDetailsSchema.index({ userId: 1 });

// Virtual for full name
paymentDetailsSchema.virtual("deliveryDetails.fullName").get(function() {
  return `${this.deliveryDetails.firstName} ${this.deliveryDetails.lastName}`;
});

// Virtual for full address
paymentDetailsSchema.virtual("deliveryDetails.fullAddress").get(function() {
  return `${this.deliveryDetails.address}, ${this.deliveryDetails.city}, ${this.deliveryDetails.state} ${this.deliveryDetails.zipCode}, ${this.deliveryDetails.country}`;
});

// Pre-save middleware to mask sensitive card information
paymentDetailsSchema.pre("save", function(next) {
  if (this.paymentDetails && this.paymentDetails.cardDetails && this.paymentDetails.cardDetails.cardNumber) {
    // Mask card number except last 4 digits
    const cardNumber = this.paymentDetails.cardDetails.cardNumber;
    if (cardNumber.length > 4) {
      this.paymentDetails.cardDetails.cardNumber = "*".repeat(cardNumber.length - 4) + cardNumber.slice(-4);
    }
  }
  next();
});

// Static method to find payments by user
paymentDetailsSchema.statics.findByUser = function(userId) {
  return this.find({ userId: userId }).sort({ createdAt: -1 });
};

// Static method to find payments by status
paymentDetailsSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ createdAt: -1 });
};

module.exports = mongoose.model("PaymentDetails", paymentDetailsSchema);
