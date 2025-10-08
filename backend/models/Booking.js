const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const bookingSchema = new mongoose.Schema({
    outfit: {type: ObjectId, ref: "Outfit", required : true },
    user: {type: ObjectId, ref: "User", required : true },
    owner: {type: ObjectId, ref: "User", required : true },
    reservationDate: {type: Date,required:true},
    returnDate: {type: Date, required: true},
    status : {type: String, enum: ["pending", "confirmed" , "cancelled"], default:"pending"},
    price: {type: Number, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    document: {type: String, required: true}, // Path to uploaded document
    paymentStatus: {type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid"},
    paymentMethod: {type: String, enum: ["card", "cash", "pay_on_return"], default: "card"}

}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema );

module.exports = Booking;
