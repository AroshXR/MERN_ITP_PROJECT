const express = require("express");  
const { 
    changeBookingStatus, 
    checkAvailabilityOfOutfit, 
    createBooking, 
    getOwnerBooking, 
    getUserBooking,
    deleteBooking,
    getBookingById,
    updateBooking,
    generateBookingReport,
    sendPayOnReturnConfirmation
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

// Admin route for booking reports
bookingRouter.get('/admin/report', protect, generateBookingReport);

// Routes for editing bookings
bookingRouter.get('/:bookingId', protect, getBookingById);
bookingRouter.put('/:bookingId', protect, upload.single('document'), updateBooking);

// Route for sending Pay on Return email
bookingRouter.post('/send-pay-on-return-email', protect, sendPayOnReturnConfirmation);

module.exports = bookingRouter;  
