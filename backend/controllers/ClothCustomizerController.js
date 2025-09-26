const mongoose = require("mongoose");
const ClothCustomizer = require("../models/ClothCustomizerModel");

const isValidObjectId = (id) => Boolean(id && mongoose.Types.ObjectId.isValid(id));

// Get all cloth customizers for the authenticated user
const getAllClothCustomizers = async (req, res) => {
    try {
        const customizers = await ClothCustomizer.find({ userId: req.user._id }).sort({ createdAt: -1 });
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

// Add new cloth customizer scoped to the authenticated user
const addClothCustomizer = async (req, res) => {
    try {
        const {
            clothingType,
            nickname,
            color,
            selectedDesign,
            placedDesigns,
            size,
            quantity,
            totalPrice
        } = req.body;

        const newCustomizer = new ClothCustomizer({
            userId: req.user._id,
            clothingType: clothingType || "tshirt",
            nickname,
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

// Get cloth customizer by ID for the authenticated user
const getClothCustomizerById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid item ID format"
            });
        }

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

// Update cloth customizer owned by the authenticated user
const updateClothCustomizer = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid item ID format"
            });
        }

        delete updateData.userId;

        const updatedCustomizer = await ClothCustomizer.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCustomizer) {
            return res.status(404).json({
                status: "error",
                message: "Cloth customizer not found or access denied"
            });
        }

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

// Delete cloth customizer owned by the authenticated user
const deleteClothCustomizer = async (req, res) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid item ID format"
            });
        }

        const deletedCustomizer = await ClothCustomizer.findOneAndDelete({
            _id: id,
            userId: req.user._id
        });

        if (!deletedCustomizer) {
            return res.status(404).json({
                status: "error",
                message: "Cloth customizer not found or access denied"
            });
        }

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
