const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    message: { type: String, required: true },
    level: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ["Customer", "Admin", "Tailor", "Applicant"]
    },
    role: {
        type: String,
        enum: ["customer", "owner", "admin"],
        default: "customer"
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    notifications: {
        type: [notificationSchema],
        default: []
    },
    identityStatus: {
        type: String,
        enum: ["unverified", "pending", "verified", "rejected"],
        default: "unverified"
    },
    identityNotes: {
        type: String,
        trim: true
    },
    identityEvidence: {
        type: String,
        trim: true
    },
    identitySubmittedAt: {
        type: Date
    },
    identityReviewedAt: {
        type: Date
    },
    identityReviewer: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model(
    "User",
    userSchema
);
