const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customizerPricesSchema = new Schema({
    // Base prices for different clothing types
    basePrices: {
        tshirt: {
            type: Number,
            required: true,
            default: 25
        }
    },
    
    // Size extra prices
    sizePrices: {
        S: { type: Number, default: 0 },
        M: { type: Number, default: 0 },
        L: { type: Number, default: 3 },
        XL: { type: Number, default: 5 },
        XXL: { type: Number, default: 8 }
    },
    
    // Preset design prices
    presetDesigns: [{
        id: { type: Number, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        preview: { type: String, required: true },
        isActive: { type: Boolean, default: true }
    }],
    
    // Custom upload price
    customUploadPrice: {
        type: Number,
        required: true,
        default: 25
    },
    
    // Metadata
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

// Update lastUpdated timestamp before saving
customizerPricesSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

module.exports = mongoose.model("CustomizerPrices", customizerPricesSchema);
