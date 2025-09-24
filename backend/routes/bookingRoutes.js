const express = require("express");  
const { 
    changeBookingStatus, 
    checkAvailabilityOfOutfit, 
    createBooking, 
    getOwnerBooking, 
    getUserBooking 
} = require("../controllers/bookingController");  // Replaced import with require
const { protect } = require("../middleware/auth");  // Replaced import with require

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfOutfit);
bookingRouter.post('/create', protect, createBooking);
bookingRouter.get('/user', protect, getUserBooking);
bookingRouter.get('/owner', protect, getOwnerBooking);
bookingRouter.post('/change-status', protect, changeBookingStatus);

module.exports = bookingRouter;  
