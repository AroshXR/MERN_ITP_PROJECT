const Booking = require("../models/Booking");
const Outfit = require("../models/Outfit");
const { sendPayOnReturnEmail } = require("../services/emailService");
const puppeteer = require('puppeteer');

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

// Exporting functions using CommonJS
// API to send Pay on Return email
const sendPayOnReturnConfirmation = async (req, res) => {
    try {
        const { bookingId } = req.body;  // Gets booking ID from request
        const userId = req.user._id;

        // Find the booking and populate outfit and user details
        const booking = await Booking.findById(bookingId)
            .populate('outfit')
            .populate('user');

        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        // Verify the booking belongs to the user
        if (booking.user._id.toString() !== userId.toString()) {
            return res.json({ success: false, message: "Unauthorized access" });
        }

        // Check if booking is confirmed
        if (booking.status !== 'confirmed') {
            return res.json({ success: false, message: "Only confirmed bookings can use Pay on Return" });
        }

        // Send the email
        const emailResult = await sendPayOnReturnEmail(booking, booking.email);

        if (emailResult.success) {
            res.json({ 
                success: true, 
                message: "Pay on Return confirmation email sent successfully",
                messageId: emailResult.messageId 
            });
        } else {
            res.json({ 
                success: false, 
                message: "Failed to send email: " + emailResult.error 
            });
        }
    } catch (error) {
        console.error('Error sending Pay on Return email:', error);
        res.json({ success: false, message: error.message });
    }
};

//API to generate booking report as PDF
const generateBookingReportPDF = async (req, res) => {
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

        const summary = {
            totalBookings,
            totalRevenue,
            statusCounts,
            reportPeriod: {
                startDate: startDate || 'All time',
                endDate: endDate || 'Present'
            }
        };

        // Get current user info for the report
        const currentUser = req.user;
        const currency = 'Rs.';

        // Generate HTML content for PDF
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Booking Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                .header h1 { color: #000; margin: 0; }
                .header p { margin: 5px 0; color: #333; }
                .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #ccc; }
                .summary h2 { color: #000; margin-top: 0; }
                .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
                .summary-item { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #000; border: 1px solid #ddd; }
                .summary-item h3 { margin: 0 0 5px 0; color: #000; }
                .summary-item p { margin: 0; font-size: 18px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #000; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ccc; }
                th { background: #000; color: white; font-weight: bold; }
                tr:nth-child(even) { background: #f9f9f9; }
                tr:nth-child(odd) { background: white; }
                .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid #000; }
                .status.pending { background: #e6e6e6; color: #000; }
                .status.confirmed { background: #d4d4d4; color: #000; }
                .status.cancelled { background: #b8b8b8; color: #000; }
                .outfit-info { display: flex; align-items: center; gap: 10px; }
                .outfit-img { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; }
                @media print { body { margin: 0; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>📊 Booking Report</h1>
                <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Owner:</strong> ${currentUser?.username || 'Owner'}</p>
                <p><strong>Report Period:</strong> ${summary.reportPeriod.startDate} to ${summary.reportPeriod.endDate}</p>
            </div>

            <div class="summary">
                <h2>📈 Summary & Analytics</h2>
                <div class="summary-grid">
                    <div class="summary-item">
                        <h3>Total Bookings</h3>
                        <p>${summary.totalBookings}</p>
                    </div>
                    <div class="summary-item">
                        <h3>Total Revenue</h3>
                        <p>${currency}${summary.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div class="summary-item">
                        <h3>Confirmed Bookings</h3>
                        <p>${summary.statusCounts.confirmed || 0}</p>
                    </div>
                    <div class="summary-item">
                        <h3>Pending Bookings</h3>
                        <p>${summary.statusCounts.pending || 0}</p>
                    </div>
                </div>
            </div>

            <h2>📋 Detailed Booking Information</h2>
            <table>
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>Outfit Details</th>
                        <th>Customer</th>
                        <th>Booking Period</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${bookings.map(booking => {
                        const startDate = new Date(booking.reservationDate).toLocaleDateString()
                        const endDate = new Date(booking.returnDate).toLocaleDateString()
                        const duration = Math.ceil((new Date(booking.returnDate) - new Date(booking.reservationDate)) / (1000 * 60 * 60 * 24))
                        
                        return `
                        <tr>
                            <td>#${booking._id.toString().slice(-6)}</td>
                            <td>
                                <div class="outfit-info">
                                    <div>
                                        <strong>${booking.outfit?.brand || 'N/A'} - ${booking.outfit?.model || 'N/A'}</strong><br>
                                        <small>${booking.outfit?.category || 'N/A'} | ${booking.outfit?.location || 'N/A'}</small>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <strong>${booking.user?.username || 'N/A'}</strong><br>
                                <small>${booking.user?.email || 'N/A'}</small>
                            </td>
                            <td>
                                <strong>Start:</strong> ${startDate}<br>
                                <strong>End:</strong> ${endDate}
                            </td>
                            <td>${duration} day${duration !== 1 ? 's' : ''}</td>
                            <td><span class="status ${booking.status}">${booking.status.toUpperCase()}</span></td>
                            <td><strong>${currency}${booking.price.toFixed(2)}</strong></td>
                        </tr>
                        `
                    }).join('')}
                </tbody>
            </table>

            <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
                <p>This report was generated automatically by the Outfit Rental Management System</p>
                <p>© ${new Date().getFullYear()} - All rights reserved</p>
            </div>
        </body>
        </html>
        `;

        // Launch puppeteer and generate PDF
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });
        
        await browser.close();

        // Set response headers for PDF download
        const filename = `booking-report-${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        // Send the PDF buffer
        res.send(pdfBuffer);

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

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
    generateBookingReportPDF,
    sendPayOnReturnConfirmation
};
