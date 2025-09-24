const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const outfitSchema = new mongoose.Schema({
    owner: { type: ObjectId, ref: 'User' },  // fixed
    brand: { type: String, required: true },
    model: { type: String, required: true },
    image: { type: String, required: true }, // Main image (required)
    images: [{ type: String }], // Additional images (optional, max 3)
    condition: { type: String, required: true },
    category: { type: String, required: true },
    material: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    pricePerDay: { type: Number, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Outfit = mongoose.model('Outfit', outfitSchema);

module.exports = Outfit;
