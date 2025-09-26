const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    OrderID: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    PaymentID: {
        type: String,
        required: true,
        trim: true
    },
    DesignID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClothCustomizer',
        required: true
    },
    Price: {
        type: Number,
        required: true,
        min: 0
    },
    AdminID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Made optional in case user is not logged in
    },
    ItemID: {
        type: String,
        required: true,
        trim: true
    },
    CustomerName: {
        type: String,
        required: false,
        trim: true,
        maxlength: 120
    },
    status: {
        type: String,
        enum: ["pending", "processing", "completed", "cancelled", "failed"],
        default: "pending"
    }
});

module.exports = mongoose.model(
    "Order",
    orderSchema
);


