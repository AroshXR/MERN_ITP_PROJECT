const Booking = require("../models/Booking");
const Outfit = require("../models/Outfit");

// Function to check the availability of the Outfit at a given date
const checkAvailability = async (outfit, reservationDate, returnDate) => {
    const bookings = await Booking.find({
        outfit,
        status: { $in: ["pending", "confirmed"] }, // Check both pending and confirmed bookings
        reservationDate: { $lte: returnDate },
        returnDate: { $gte: reservationDate },
    });
    return bookings.length === 0;
};

// API to check availability of Outfit for given Date and Location
const checkAvailabilityOfOutfit = async (req, res) => {
    try {
        const { location, reservationDate, returnDate } = req.body;

        // Fetch all available outfits for the given location
        const outfits = await Outfit.find({ location, isAvailable: true });

        // Check outfit availability for the given date range using promises
        const availableOutfitsPromises = outfits.map(async (outfit) => {
            const isAvailable = await checkAvailability(outfit._id, reservationDate, returnDate);
            return { ...outfit._doc, isAvailable };
        });

        let availableOutfits = await Promise.all(availableOutfitsPromises);
        availableOutfits = availableOutfits.filter(outfit => outfit.isAvailable === true);

        res.json({ success: true, availableOutfits });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to create booking
const createBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { outfit, reservationDate, returnDate, phone, email } = req.body;
        const documentFile = req.file;

        // Validate required fields
        if (!phone || !email || !documentFile) {
            return res.json({ success: false, message: "Phone, email, and document are required" });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({ success: false, message: "Invalid email format" });
        }

        // Basic phone validation (should contain only digits and be at least 10 characters)
        const phoneRegex = /^[0-9]{10,}$/;
        if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            return res.json({ success: false, message: "Invalid phone number format" });
        }

        const isAvailable = await checkAvailability(outfit, reservationDate, returnDate);
        if (!isAvailable) {
            return res.json({ success: false, message: "Outfit Not Available" });
        }

        const outfitData = await Outfit.findById(outfit);
        if (!outfitData) {
            return res.json({ success: false, message: "Outfit not found" });
        }

        // Calculate price based on Reservation Date and Return Date
        const reserved = new Date(reservationDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - reserved) / (1000 * 60 * 60 * 24));  // Calculate number of days
        const price = outfitData.pricePerDay * noOfDays;
        
        await Booking.create({ 
            outfit, 
            owner: outfitData.owner, 
            user: _id, 
            reservationDate, 
            returnDate, 
            price,
            phone,
            email,
            document: documentFile.path // Store the file path
        });

        res.json({ success: true, message: "Booking Created" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to list User bookings
const getUserBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const bookings = await Booking.find({ user: _id }).populate("outfit").sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get Owner Bookings
const getOwnerBooking = async (req, res) => {
    try {
        if (req.user.type !== 'owner' && req.user.role !== 'owner' && req.user.role !== 'admin' && req.user.type !== 'Admin') {
            return res.json({ success: false, message: "Unauthorized" });
        }
        
        // For admin users, get all bookings. For owner users, get only their own
        let bookingQuery = {};
        if (req.user.role === 'admin' || req.user.type === 'Admin') {
            bookingQuery = {}; // Get all bookings
        } else {
            bookingQuery = { owner: req.user._id }; // Get only owner's bookings
        }
        
        const bookings = await Booking.find(bookingQuery)
            .populate('outfit user')
            .select("-user.password")
            .sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to Change the booking status
const changeBookingStatus = async (req, res) => {
    try {
        const { _id, role, type } = req.user;
        const { bookingId, status } = req.body;

        const booking = await Booking.findById(bookingId);

        // Admin users can change any booking status, owner users can only change their own
        if (role !== 'admin' && type !== 'Admin' && booking.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to delete booking
const deleteBooking = async (req, res) => {
    try {
        const { _id } = req.user;
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        // Only the user who created the booking can delete it
        if (booking.user.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized to delete this booking" });
        }

        await Booking.findByIdAndDelete(bookingId);

        res.json({ success: true, message: "Booking deleted successfully" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to get single booking by ID for editing
const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { _id } = req.user;

        const booking = await Booking.findOne({ _id: bookingId, user: _id }).populate('outfit');
        
        if (!booking) {
            return res.json({ success: false, message: "Booking not found or you don't have permission to edit it" });
        }

        res.json({ success: true, booking });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to generate booking report for admin
const generateBookingReport = async (req, res) => {
    try {
        const { role, type } = req.user;
        
        // Only admin can generate reports
        if (role !== 'admin' && type !== 'Admin') {
            return res.json({ success: false, message: "Unauthorized - Admin access required" });
        }

        const { startDate, endDate, status, location } = req.query;
        
        // Build query based on filters
        let query = {};
        
        // Date filter
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate + 'T23:59:59.999Z')
            };
        }
        
        // Status filter
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Get all bookings with populated data
        let bookings = await Booking.find(query)
            .populate({
                path: 'outfit',
                select: 'brand model category pricePerDay location image'
            })
            .populate({
                path: 'user',
                select: 'username email'
            })
            .populate({
                path: 'owner',
                select: 'username email'
            })
            .sort({ createdAt: -1 });

        // Location filter (after population)
        if (location && location !== 'all') {
            bookings = bookings.filter(booking => 
                booking.outfit && booking.outfit.location === location
            );
        }

        // Calculate summary statistics
        const totalBookings = bookings.length;
        const totalRevenue = bookings
            .filter(booking => booking.status === 'confirmed')
            .reduce((sum, booking) => sum + booking.price, 0);
        
        const statusCounts = bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {});

        const reportData = {
            bookings,
            summary: {
                totalBookings,
                totalRevenue,
                statusCounts,
                reportPeriod: {
                    startDate: startDate || 'All time',
                    endDate: endDate || 'Present'
                }
            }
        };

        res.json({ success: true, reportData });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to update booking details
const updateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { _id } = req.user;
        const { reservationDate, returnDate, phone, email } = req.body;
        const documentFile = req.file;

        // Verify booking belongs to the user
        const existingBooking = await Booking.findOne({ _id: bookingId, user: _id }).populate('outfit');
        if (!existingBooking) {
            return res.json({ success: false, message: "Booking not found or you don't have permission to edit it" });
        }

        // Only allow editing if booking is still pending
        if (existingBooking.status !== 'pending') {
            return res.json({ success: false, message: "Only pending bookings can be edited" });
        }

        // Validate required fields
        if (!phone || !email) {
            return res.json({ success: false, message: "Phone and email are required" });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({ success: false, message: "Invalid email format" });
        }

        // Basic phone validation
        const phoneRegex = /^[0-9]{10,}$/;
        if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            return res.json({ success: false, message: "Invalid phone number format" });
        }

        // Check availability for new dates (excluding current booking)
        const bookings = await Booking.find({
            outfit: existingBooking.outfit._id,
            status: { $in: ["pending", "confirmed"] },
            _id: { $ne: bookingId }, // Exclude current booking
            reservationDate: { $lte: returnDate },
            returnDate: { $gte: reservationDate },
        });

        if (bookings.length > 0) {
            return res.json({ success: false, message: "Outfit not available for the selected dates" });
        }

        // Calculate new price if dates changed
        let price = existingBooking.price;
        if (reservationDate !== existingBooking.reservationDate.toISOString().split('T')[0] || 
            returnDate !== existingBooking.returnDate.toISOString().split('T')[0]) {
            const reserved = new Date(reservationDate);
            const returned = new Date(returnDate);
            const noOfDays = Math.ceil((returned - reserved) / (1000 * 60 * 60 * 24));
            price = existingBooking.outfit.pricePerDay * noOfDays;
        }

        // Update booking details
        const updateData = {
            reservationDate,
            returnDate,
            phone,
            email,
            price
        };

        // Update document if new file provided
        if (documentFile) {
            updateData.document = documentFile.path;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            updateData,
            { new: true }
        ).populate('outfit');

        res.json({ success: true, message: "Booking updated successfully", booking: updatedBooking });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to update booking payment status
const updateBookingPaymentStatus = async (req, res) => {
    try {
        const { bookingId, paymentStatus } = req.body;

        if (!bookingId || !paymentStatus) {
            return res.json({ success: false, message: "Booking ID and payment status are required" });
        }

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { paymentStatus },
            { new: true }
        );

        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        res.json({ success: true, message: "Payment status updated successfully", booking });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to send booking QR code via email (Pay on Return)
const sendBookingQRCode = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.json({ success: false, message: "Booking ID is required" });
        }

        const booking = await Booking.findById(bookingId)
            .populate('outfit')
            .populate('user')
            .populate('owner');

        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        // Update booking to set payment method as pay_on_return
        booking.paymentMethod = 'pay_on_return';
        await booking.save();

        // Generate QR code data URL
        const QRCode = require('qrcode');
        const qrData = JSON.stringify({
            bookingId: booking._id,
            outfitName: `${booking.outfit.brand} ${booking.outfit.model}`,
            category: booking.outfit.category,
            location: booking.outfit.location,
            reservationDate: booking.reservationDate,
            returnDate: booking.returnDate,
            price: booking.price,
            phone: booking.phone,
            email: booking.email,
            status: booking.status,
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod
        });

        const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300,
            margin: 2
        });

        // Send email with QR code
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: booking.email,
            subject: `Outfit Rental Booking - Pay on Return - ${booking.outfit.brand} ${booking.outfit.model}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
                        .header h1 { margin: 0; font-size: 28px; }
                        .content { padding: 30px; }
                        .qr-section { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0; }
                        .qr-section img { max-width: 300px; border: 3px solid #667eea; border-radius: 8px; }
                        .booking-details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
                        .detail-label { font-weight: bold; color: #374151; }
                        .detail-value { color: #6b7280; }
                        .alert-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; }
                        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎫 Booking Confirmation</h1>
                            <p>Pay on Return - QR Code</p>
                        </div>
                        
                        <div class="content">
                            <h2>Dear ${booking.user.firstName || 'Customer'},</h2>
                            <p>Your outfit rental booking has been confirmed with <strong>Pay on Return</strong> option. Please show this QR code when you return the outfit to complete your payment.</p>
                            
                            <div class="qr-section">
                                <h3>📱 Your Booking QR Code</h3>
                                <img src="${qrCodeDataURL}" alt="Booking QR Code" />
                                <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">Scan this code at pickup/return</p>
                            </div>
                            
                            <div class="booking-details">
                                <h3 style="margin-top: 0; color: #1f2937;">📋 Booking Details</h3>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Booking ID:</span>
                                    <span class="detail-value">${booking._id}</span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Outfit:</span>
                                    <span class="detail-value"><strong>${booking.outfit.brand} ${booking.outfit.model}</strong></span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Category:</span>
                                    <span class="detail-value">${booking.outfit.category}</span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Pickup Location:</span>
                                    <span class="detail-value">${booking.outfit.location}</span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Rental Period:</span>
                                    <span class="detail-value">${new Date(booking.reservationDate).toLocaleDateString()} to ${new Date(booking.returnDate).toLocaleDateString()}</span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Total Amount:</span>
                                    <span class="detail-value"><strong>$${booking.price.toFixed(2)}</strong></span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Payment Method:</span>
                                    <span class="detail-value">Pay on Return</span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Status:</span>
                                    <span class="detail-value">${booking.status.toUpperCase()}</span>
                                </div>
                            </div>
                            
                            <div class="alert-box">
                                <h4 style="margin-top: 0;">⚠️ Important Information</h4>
                                <ul style="margin: 10px 0; padding-left: 20px;">
                                    <li>Please bring this email or screenshot the QR code</li>
                                    <li>Payment will be collected when you return the outfit</li>
                                    <li>Accepted payment methods: Cash or Card</li>
                                    <li>Late returns may incur additional charges</li>
                                    <li>Contact us if you need to modify your booking</li>
                                </ul>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <p style="color: #6b7280;">You can view your booking details anytime by scanning the QR code</p>
                                <p style="color: #6b7280; font-size: 14px;">Booking confirmed on: ${new Date().toLocaleString()}</p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p><strong>Outfit Rental Service</strong></p>
                            <p>📧 Contact: ${process.env.EMAIL_USER}</p>
                            <p>📞 Phone: ${booking.phone}</p>
                            <p>© 2025 - All Rights Reserved</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: "QR code sent to your email successfully!",
            qrCodeDataURL // Also return the QR code for immediate display
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Exporting functions using CommonJS
module.exports = {
    checkAvailabilityOfOutfit,
    createBooking,
    getUserBooking,
    getOwnerBooking,
    changeBookingStatus,
    deleteBooking,
    getBookingById,
    updateBooking,
    generateBookingReport,
    updateBookingPaymentStatus,
    sendBookingQRCode
};
