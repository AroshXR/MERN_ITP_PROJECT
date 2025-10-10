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
    generateBookingReportPDF,
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
bookingRouter.get('/admin/report/pdf', protect, generateBookingReportPDF);

// Routes for editing bookings
bookingRouter.get('/:bookingId', protect, getBookingById);
bookingRouter.put('/:bookingId', protect, upload.single('document'), updateBooking);

// Route for sending Pay on Return email
bookingRouter.post('/send-pay-on-return-email', protect, sendPayOnReturnConfirmation); // Route handles the request

// Return reminder routes
bookingRouter.post('/send-return-reminder/:bookingId', protect, async (req, res) => {
  try {
    const { sendManualReminder } = require('../services/reminderScheduler');
    const result = await sendManualReminder(req.params.bookingId);
    
    if (result.success) {
      res.json({
        status: 'ok',
        message: 'Return reminder sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to send return reminder: ' + error.message
    });
  }
});

// Check upcoming returns that need reminders
bookingRouter.get('/upcoming-returns', protect, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(23, 59, 59, 999);
    
    const upcomingReturns = await Booking.find({
      returnDate: {
        $gte: today,
        $lte: tomorrow
      },
      status: 'confirmed'
    }).populate('user').populate('outfit');
    
    res.json({
      status: 'ok',
      message: 'Upcoming returns retrieved successfully',
      count: upcomingReturns.length,
      data: upcomingReturns.map(booking => ({
        id: booking._id,
        bookingId: booking._id.toString().slice(-6),
        customerName: booking.user?.username || 'N/A',
        customerEmail: booking.email,
        outfitBrand: booking.outfit?.brand || 'N/A',
        outfitModel: booking.outfit?.model || 'N/A',
        returnDate: booking.returnDate,
        daysUntilReturn: Math.ceil((new Date(booking.returnDate) - new Date()) / (1000 * 60 * 60 * 24))
      }))
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get upcoming returns: ' + error.message
    });
  }
});

// Trigger manual reminder check
bookingRouter.post('/check-reminders', protect, async (req, res) => {
  try {
    const { checkReturnReminders } = require('../services/reminderScheduler');
    await checkReturnReminders();
    
    res.json({
      status: 'ok',
      message: 'Return reminder check completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to check reminders: ' + error.message
    });
  }
});

module.exports = bookingRouter;  
