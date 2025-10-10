const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const bookingSchema = new mongoose.Schema({
    outfit: {type: ObjectId, ref: "Outfit", required : true },  // WHAT is being rented
    user: {type: ObjectId, ref: "User", required : true },  // WHO is renting
    owner: {type: ObjectId, ref: "User", required : true },  // WHO owns the outfit
    reservationDate: {type: Date,required:true},
    returnDate: {type: Date, required: true},
    status : {type: String, enum: ["pending", "confirmed" , "cancelled"], default:"pending"},
    price: {type: Number, required: true},
    phone: {type: String, required: true},
    email: {type: String, required: true},
    document: {type: String, required: true} // Path to uploaded document  (from multer)


}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema );

module.exports = Booking;
