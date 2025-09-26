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
        const files = req.files; // This is an object with field names as keys

        if (!files || (!files.mainImage && !files.additionalImages)) {
            return res.json({ success: false, message: "At least one image is required" });
        }

        // Upload main image (required)
        const mainImageFile = files.mainImage ? files.mainImage[0] : null;
        if (!mainImageFile) {
            return res.json({ success: false, message: "Main image is required" });
        }

        const mainFileBuffer = fs.readFileSync(mainImageFile.path);
        const mainResponse = await imagekit.upload({
            file: mainFileBuffer,
            fileName: mainImageFile.originalname,
            folder: '/outfits'
        });

        const mainOptimizedImageUrl = imagekit.url({
            path: mainResponse.filePath,
            transformation: [
                { width: '1280' },
                { quality: 'auto' },
                { format: 'webp' }
            ]
        });

        // Upload additional images (optional, max 3)
        const additionalImages = [];
        const additionalFiles = files.additionalImages || [];
        
        for (let i = 0; i < Math.min(additionalFiles.length, 3); i++) {
            const file = additionalFiles[i];
            const fileBuffer = fs.readFileSync(file.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: file.originalname,
                folder: '/outfits'
            });

            const optimizedImageUrl = imagekit.url({
                path: response.filePath,
                transformation: [
                    { width: '1280' },
                    { quality: 'auto' },
                    { format: 'webp' }
                ]
            });
            additionalImages.push(optimizedImageUrl);
        }

        await Outfit.create({ 
            ...outfit, 
            owner: _id, 
            image: mainOptimizedImageUrl,
            images: additionalImages
        });

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

//API to get all outfits (for frontend browsing)
const getAllOutfits = async (req, res) => {
    try {
        const { location, category, search, minPrice, maxPrice } = req.query;
        
        let query = { isAvailable: true };
        
        if (location) query.location = location;
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.pricePerDay = {};
            if (minPrice) query.pricePerDay.$gte = Number(minPrice);
            if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
        }
        if (search) {
            query.$or = [
                { brand: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get all outfits matching the query
        let outfits = await Outfit.find(query).populate('owner', 'username email');
        
        // Filter out outfits with pending or confirmed bookings
        const availableOutfits = [];
        
        for (const outfit of outfits) {
            const activeBookings = await Booking.find({
                outfit: outfit._id,
                status: { $in: ['pending', 'confirmed'] }
            });
            
            // Only include outfit if no pending or confirmed bookings exist
            if (activeBookings.length === 0) {
                availableOutfits.push(outfit);
            }
        }
        
        res.json({ success: true, outfits: availableOutfits });
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

//API to delete an Outfit (hard delete with related bookings)
const deleteOutfit = async (req, res) => {
    try {
        const { _id } = req.user;
        const { outfitId } = req.body;
        const outfit = await Outfit.findById(outfitId);

        if (!outfit) {
            return res.json({ success: false, message: "Outfit not found" });
        }

        // Checking if the outfit belongs to the user
        if (outfit.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // Delete all related bookings first
        const bookingDeleteResult = await Booking.deleteMany({ outfit: outfitId });
        
        // Delete the outfit from database
        await Outfit.findByIdAndDelete(outfitId);

        res.json({ 
            success: true, 
            message: "Outfit deleted successfully", 
            deletedBookings: bookingDeleteResult.deletedCount || 0 
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to get Dashboard data
const getDashboardData = async (req, res) => {
    try {
        const { _id, role, type } = req.user;
        if (role !== 'owner' && role !== 'admin' && type !== 'Admin') {
            return res.json({ success: false, message: "Unauthorized" });
        }
        
        // For admin users, get all outfits and bookings. For owner users, get only their own
        let outfitQuery = {};
        let bookingQuery = {};
        
        if (role === 'admin' || type === 'Admin') {
            // Admin sees all outfits and bookings
            outfitQuery = {};
            bookingQuery = {};
        } else {
            // Owner sees only their own
            outfitQuery = { owner: _id };
            bookingQuery = { owner: _id };
        }
        
        const outfits = await Outfit.find(outfitQuery)
        const bookings = await Booking.find(bookingQuery).populate('outfit user').sort({createdAt: -1}) ;

        const pendingBookings = await Booking.find({ ...bookingQuery, status: "pending" }).populate('outfit user').sort({ createdAt: -1 });
        const confirmedBookings = await Booking.find({ ...bookingQuery, status: "confirmed" }).sort({ createdAt: -1 });
        const cancelledBookings = await Booking.find({ ...bookingQuery, status: "cancelled" }).sort({ createdAt: -1 });

        // Calculate monthlyRevenue from bookings where status is confirmed
        const monthlyRevenue = confirmedBookings.reduce((acc, booking) => acc + booking.price, 0);

        const dashboardData = {
            totalOutfits: outfits.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.slice(0,3),
            confirmedBookings: confirmedBookings.length,
            cancelledBookings: cancelledBookings.length,
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

//API to get single outfit by ID for editing
const getOutfitById = async (req, res) => {
    try {
        const { outfitId } = req.params;
        const { _id } = req.user;

        const outfit = await Outfit.findOne({ _id: outfitId, owner: _id });
        
        if (!outfit) {
            return res.json({ success: false, message: "Outfit not found or you don't have permission to edit it" });
        }

        res.json({ success: true, outfit });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

//API to update outfit details
const updateOutfit = async (req, res) => {
    try {
        const { outfitId } = req.params;
        const { _id } = req.user;
        
        // Parse outfit data from request body
        let outfitData = JSON.parse(req.body.outfitData);
        const files = req.files;

        // Verify outfit belongs to the user
        const existingOutfit = await Outfit.findOne({ _id: outfitId, owner: _id });
        if (!existingOutfit) {
            return res.json({ success: false, message: "Outfit not found or you don't have permission to edit it" });
        }

        // Handle image updates
        let imageUrl = existingOutfit.image; // Keep existing image by default
        let additionalImages = existingOutfit.additionalImages || []; // Keep existing additional images

        // Update main image if provided
        if (files && files.mainImage) {
            const mainImageFile = files.mainImage[0];
            const fileBuffer = fs.readFileSync(mainImageFile.path);
            const mainImageUpload = await imagekit.upload({
                file: fileBuffer,
                fileName: `outfit_${Date.now()}_main.${mainImageFile.originalname.split('.').pop()}`,
                folder: '/outfits'
            });
            imageUrl = mainImageUpload.url;
        }

        // Update additional images if provided
        if (files && files.additionalImages) {
            const additionalImageUploads = [];
            for (const file of files.additionalImages) {
                const fileBuffer = fs.readFileSync(file.path);
                const upload = await imagekit.upload({
                    file: fileBuffer,
                    fileName: `outfit_${Date.now()}_additional.${file.originalname.split('.').pop()}`,
                    folder: '/outfits'
                });
                additionalImageUploads.push(upload.url);
            }
            additionalImages = additionalImageUploads;
        }

        // Update outfit in database
        const updatedOutfit = await Outfit.findByIdAndUpdate(
            outfitId,
            {
                ...outfitData,
                image: imageUrl,
                additionalImages: additionalImages
            },
            { new: true }
        );

        res.json({ success: true, message: "Outfit updated successfully", outfit: updatedOutfit });
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
    getAllOutfits,
    toggleOutfitAvailability,
    deleteOutfit,
    getDashboardData,
    updateUserImage,
    getOutfitById,
    updateOutfit
};
