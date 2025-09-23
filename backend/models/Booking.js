const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const bookingSchema = new mongoose.Schema({
    outfit: {type: ObjectId, ref: "Outfit", required : true },
    user: {type: ObjectId, ref: "User", required : true },
    owner: {type: ObjectId, ref: "User", required : true },
    reservationDate: {type: Date,required:true},
    status : {type: String, enum: ["pending ", "confirmed" , "cancelled"], default:"pending"},
    price: {type: Number, required: true}


}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema );

module.exports = Booking;
