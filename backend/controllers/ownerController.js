const User = require("../models/User");
const fs = require("fs");  // Replaced import with require
const imagekit = require("../configs/imageKit");  // Replaced import with require
const Outfit = require("../models/Outfit");
const Booking = require("../models/Booking");

// API to change Role of the User
const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: "owner" });
        res.json({ success: true, message: "Now You can List Outfits" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// API to List Outfit
const addOutfit = async (req, res) => {
    try {
        const { _id } = req.user;
        let outfit = JSON.parse(req.body.outfitData);
        const imageFile = req.file;

        // Upload Imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/outfits'
        });

        // Optimization through imagekit URL transformation
        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '1280' }, // width resizing
                { quality: 'auto' }, // auto compression
                { format: 'webp' } // convert to modern format
            ]
        });

        const image = optimizedImageUrl;
        await Outfit.create({ ...outfit, owner: _id, image });  // store the outfit data in MongoDB

        res.json({ success: true, message: "Outfit Added" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};


//API to list owner Outfits

const getOwnerOutfits = async (req, res) => {
    try {
        const { _id } = req.user;
        const outfits = await Outfit.find({ owner: _id });
        res.json({ success: true, outfits });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to toggle car availability
const toggleOutfitAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { outfitId } = req.body;
        const outfit = await Outfit.findById(outfitId);

        // Checking if the outfit belongs to the user
        if (outfit.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }
        outfit.isAvailable = !outfit.isAvailable;
        await outfit.save();

        res.json({ success: true, message: "Availability Toggled" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to delete an Outfit
const deleteOutfit = async (req, res) => {
    try {
        const { _id } = req.user;
        const { outfitId } = req.body;
        const outfit = await Outfit.findById(outfitId);

        // Checking if the outfit belongs to the user
        if (outfit.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }
        outfit.owner = null;
        outfit.isAvailable = false;
        await outfit.save();

        res.json({ success: true, message: "Outfit Removed" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to get Dashboard data
const getDashboardData = async (req, res) => {
    try {
        const { _id, role } = req.user;
        if (role !== 'owner') {
            return res.json({ success: false, message: "Unauthorized" });
        }
        
        const outfits = await Outfit.find({ owner: _id })
        const bookings = await Booking.find({owner: _id}).populate('outfit').sort({createdAt: -1}) ;

        const pendingBookings =await Booking.find({owner: _id, status: "pending"})
        const completedBookings =await Booking.find({owner: _id, status: "confirmed"})

        //Calculate monthlyRevenue from bookings where status is confirmed
        const monthlyRevenue = bookings.slice().filter(booking => booking.status === 'confirmed').reduce((acc,booking)=> acc+ booking.price, 0)

        const dashboardData = {
            totalOutfits: outfits.length,
            totalBookings: bookings.length,
            pendingBookings: bookings.slice(0,3),
            monthlyRevenue
        }

        res.json({success:true, dashboardData});


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};


// API to update User Image
const updateUserImage = async (req, res) => {
    try {
        const { _id } = req.user;
        const imageFile = req.file;

        // Upload Imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        });

        // Optimization through imagekit URL transformation
        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '1280' }, // width resizing
                { quality: 'auto' }, // auto compression
                { format: 'webp' } // convert to modern format
            ]
        });

        const image = optimizedImageUrl;

        await User.findByIdAndUpdate(_id, { image });
        res.json({ success: true, message: "Image Updated" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};



// Exporting functions using CommonJS
module.exports = {
    changeRoleToOwner,
    addOutfit,
    getOwnerOutfits,
    toggleOutfitAvailability,
    deleteOutfit,
    getDashboardData,
    updateUserImage
    
};
