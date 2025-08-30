const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Route to upload a single image
router.post("/image", upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: "error",
                message: "No image file provided"
            });
        }

        // Create the image URL
        const imageUrl = `/uploads/${req.file.filename}`;
        
        res.status(200).json({
            status: "ok",
            message: "Image uploaded successfully",
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                url: imageUrl
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            status: "error",
            message: "Error uploading image",
            error: error.message
        });
    }
});

// Route to serve uploaded images
router.get("/uploads/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            status: "error",
            message: "Image not found"
        });
    }
    
    res.sendFile(filePath);
});

module.exports = router; 