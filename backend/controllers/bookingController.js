const Booking = require("../models/Booking");
const Outfit = require("../models/Outfit");

// Function to check the availability of the Outfit at a given date
const checkAvailability = async (outfit, reservationDate, returnDate) => {
    const bookings = await Booking.find({
        outfit,
        status: "confirmed", // Only check confirmed bookings
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
        const { outfit, reservationDate, returnDate } = req.body;

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
        
        await Booking.create({ outfit, owner: outfitData.owner, user: _id, reservationDate, returnDate, price });

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
        const bookings = (await Booking.find({ user: _id }).populate("outfit")).sort({ createdAt: -1 });  // Fixed to use sort() instead of toSorted

        res.json({ success: true, bookings });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to get Owner Bookings
const getOwnerBooking = async (req, res) => {
    try {
        if (req.user.role !== 'owner') {
            return res.json({ success: false, message: "Unauthorized" });
        }
        const bookings = await Booking.find({ owner: req.user._id })
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
        const { _id } = req.user;
        const { bookingId, status } = req.body;

        const booking = await Booking.findById(bookingId);

        if (booking.owner.toString() !== _id.toString()) {  // Fixed from 'bookingId.owner' to 'booking.owner'
            return res.json({ success: false, message: "Unauthorized" });
        }

        booking.status = status;  // Fixed typo: "satatus" -> "status"
        await booking.save();

        res.json({ success: true, message: "Status Updated" });
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
    changeBookingStatus
};
