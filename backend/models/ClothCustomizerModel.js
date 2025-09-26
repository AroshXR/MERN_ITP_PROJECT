const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clothCustomizerSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clothingType: {
        type: String,
        required: true,
        enum: ["tshirt"],
        default: "tshirt"
    },
    nickname: {
        type: String,
        trim: true,
        maxlength: 50,
        default: 'My Custom T-Shirt'
    },
    color: {
        type: String,
        required: true,
    },
    selectedDesign: {
        id: { type: String, default: null },
        name: { type: String, default: null },
        price: { type: Number, default: 0 },
        preview: { type: String, default: null },
        position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 }
        },
        size: { type: Number, default: 80 },
        isCustomUpload: { type: Boolean, default: false }
    },
    placedDesigns: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        preview: { type: String, required: true },
        side: { type: String, enum: ["front"], default: "front" },
        position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 }
        },
        size: { type: Number, default: 80 },
        isCustomUpload: { type: Boolean, default: false }
    }],
    size: {
        type: String,
        enum: ["S", "M", "L", "XL", "XXL"],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model(
    "ClothCustomizer",   // collection name
    clothCustomizerSchema // schema reference
);
