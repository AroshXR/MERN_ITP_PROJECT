const express = require("express");  
const { 
    changeBookingStatus, 
    checkAvailabilityOfOutfit, 
    createBooking, 
    getOwnerBooking, 
    getUserBooking,
    deleteBooking,
    getBookingById,
    updateBooking
} = require("../controllers/bookingController");  // Replaced import with require
const { protect } = require("../middleware/auth");  // Replaced import with require
const upload = require("../middleware/multer");

const bookingRouter = express.Router();

bookingRouter.post('/check-availability', checkAvailabilityOfOutfit);
bookingRouter.post('/create', protect, upload.single('document'), createBooking);
bookingRouter.get('/user', protect, getUserBooking);
bookingRouter.get('/owner', protect, getOwnerBooking);
bookingRouter.post('/change-status', protect, changeBookingStatus);
bookingRouter.delete('/:bookingId', protect, deleteBooking);

// Routes for editing bookings
bookingRouter.get('/:bookingId', protect, getBookingById);
bookingRouter.put('/:bookingId', protect, upload.single('document'), updateBooking);

module.exports = bookingRouter;  
