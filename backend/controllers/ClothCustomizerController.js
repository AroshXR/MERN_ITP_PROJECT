const ClothCustomizer = require("../models/ClothCustomizerModel");

// Get all cloth customizers (temporarily returns all items for testing)
const getAllClothCustomizers = async (req, res) => {
    try {
        // Temporarily disabled user filtering for testing
        // const customizers = await ClothCustomizer.find({ userId: req.user._id });
        const customizers = await ClothCustomizer.find();
        res.status(200).json({
            status: "ok",
            data: customizers
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error fetching cloth customizers",
            error: error.message
        });
    }
};

// Add new cloth customizer (temporarily allows creation without user ID)
const addClothCustomizer = async (req, res) => {
    try {
        const { 
            clothingType, 
            color, 
            selectedDesign, 
            placedDesigns, 
            size, 
            quantity, 
            totalPrice 
        } = req.body;
        
        const newCustomizer = new ClothCustomizer({
            // Temporarily disabled user ID requirement for testing
            // userId: req.user._id,
            userId: "000000000000000000000000", // Placeholder user ID
            clothingType: clothingType || "tshirt",
            color,
            selectedDesign,
            placedDesigns: placedDesigns || [],
            size,
            quantity,
            totalPrice
        });

        const savedCustomizer = await newCustomizer.save();
        
        res.status(201).json({
            status: "ok",
            message: "Cloth customizer created successfully",
            data: savedCustomizer
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error creating cloth customizer",
            error: error.message
        });
    }
};

// Get cloth customizer by ID (only for the authenticated user)
const getClothCustomizerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customizer = await ClothCustomizer.findOne({ _id: id, userId: req.user._id });
        
        if (!customizer) {
            return res.status(404).json({
                status: "error",
                message: "Cloth customizer not found"
            });
        }
        
        res.status(200).json({
            status: "ok",
            data: customizer
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error fetching cloth customizer",
            error: error.message
        });
    }
};

// Update cloth customizer (only for the authenticated user)
const updateClothCustomizer = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Ensure the item belongs to the authenticated user
        const existingCustomizer = await ClothCustomizer.findOne({ _id: id, userId: req.user._id });
        if (!existingCustomizer) {
            return res.status(404).json({
                status: "error",
                message: "Cloth customizer not found or access denied"
            });
        }
        
        const updatedCustomizer = await ClothCustomizer.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            status: "ok",
            message: "Cloth customizer updated successfully",
            data: updatedCustomizer
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error updating cloth customizer",
            error: error.message
        });
    }
};

// Delete cloth customizer (only for the authenticated user)
const deleteClothCustomizer = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Ensure the item belongs to the authenticated user
        const existingCustomizer = await ClothCustomizer.findOne({ _id: id, userId: req.user._id });
        if (!existingCustomizer) {
            return res.status(404).json({
                status: "error",
                message: "Cloth customizer not found or access denied"
            });
        }
        
        await ClothCustomizer.findByIdAndDelete(id);
        
        res.status(200).json({
            status: "ok",
            message: "Cloth customizer deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error deleting cloth customizer",
            error: error.message
        });
    }
};

module.exports = {
    getAllClothCustomizers,
    addClothCustomizer,
    getClothCustomizerById,
    updateClothCustomizer,
    deleteClothCustomizer
};
