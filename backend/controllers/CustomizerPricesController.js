const mongoose = require("mongoose");
const CustomizerPrices = require("../models/CustomizerPricesModel");

// Get current customizer prices
const getCustomizerPrices = async (req, res) => {
    try {
        let prices = await CustomizerPrices.findOne().sort({ lastUpdated: -1 });
        
        // If no prices exist, create default prices
        if (!prices) {
        prices = new CustomizerPrices({
            basePrices: {
                tshirt: 25
            },
            sizePrices: {
                S: 0,
                M: 0,
                L: 3,
                XL: 5,
                XXL: 8
            },
            presetDesigns: [
                { id: 1, name: "Design 1", price: 15, preview: "print1", isActive: true },
                { id: 2, name: "Design 2", price: 20, preview: "print2", isActive: true },
                { id: 3, name: "Design 3", price: 18, preview: "print3", isActive: true },
                { id: 4, name: "Design 4", price: 12, preview: "print4", isActive: true },
                { id: 5, name: "Design 5", price: 10, preview: "print5", isActive: true },
                { id: 6, name: "Design 6", price: 8, preview: "print6", isActive: true }
            ],
            customUploadPrice: 25,
            updatedBy: req.user?._id
        });
            
            await prices.save();
        }
        
        res.status(200).json({
            status: "ok",
            data: prices
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error fetching customizer prices",
            error: error.message
        });
    }
};

// Update customizer prices (Admin only)
const updateCustomizerPrices = async (req, res) => {
    try {
        const updateData = req.body;
        
        // Add updatedBy field
        updateData.updatedBy = req.user._id;
        
        let prices = await CustomizerPrices.findOne().sort({ lastUpdated: -1 });
        
        if (!prices) {
            // Create new prices document
            prices = new CustomizerPrices(updateData);
        } else {
            // Update existing prices
            Object.assign(prices, updateData);
        }
        
        const savedPrices = await prices.save();
        
        res.status(200).json({
            status: "ok",
            message: "Customizer prices updated successfully",
            data: savedPrices
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error updating customizer prices",
            error: error.message
        });
    }
};

// Add new preset design
const addPresetDesign = async (req, res) => {
    try {
        const { name, price, preview } = req.body;
        
        let prices = await CustomizerPrices.findOne().sort({ lastUpdated: -1 });
        
        if (!prices) {
            return res.status(404).json({
                status: "error",
                message: "No customizer prices found. Please initialize prices first."
            });
        }
        
        // Generate new ID
        const maxId = Math.max(...prices.presetDesigns.map(d => d.id), 0);
        const newDesign = {
            id: maxId + 1,
            name,
            price,
            preview,
            isActive: true
        };
        
        prices.presetDesigns.push(newDesign);
        prices.updatedBy = req.user._id;
        
        const savedPrices = await prices.save();
        
        res.status(201).json({
            status: "ok",
            message: "Preset design added successfully",
            data: savedPrices
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error adding preset design",
            error: error.message
        });
    }
};

// Update preset design
const updatePresetDesign = async (req, res) => {
    try {
        const { designId } = req.params;
        const updateData = req.body;
        
        let prices = await CustomizerPrices.findOne().sort({ lastUpdated: -1 });
        
        if (!prices) {
            return res.status(404).json({
                status: "error",
                message: "No customizer prices found"
            });
        }
        
        const designIndex = prices.presetDesigns.findIndex(d => d.id == designId);
        
        if (designIndex === -1) {
            return res.status(404).json({
                status: "error",
                message: "Preset design not found"
            });
        }
        
        // Update the design
        Object.assign(prices.presetDesigns[designIndex], updateData);
        prices.updatedBy = req.user._id;
        
        const savedPrices = await prices.save();
        
        res.status(200).json({
            status: "ok",
            message: "Preset design updated successfully",
            data: savedPrices
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error updating preset design",
            error: error.message
        });
    }
};

// Delete preset design
const deletePresetDesign = async (req, res) => {
    try {
        const { designId } = req.params;
        
        let prices = await CustomizerPrices.findOne().sort({ lastUpdated: -1 });
        
        if (!prices) {
            return res.status(404).json({
                status: "error",
                message: "No customizer prices found"
            });
        }
        
        const designIndex = prices.presetDesigns.findIndex(d => d.id == designId);
        
        if (designIndex === -1) {
            return res.status(404).json({
                status: "error",
                message: "Preset design not found"
            });
        }
        
        // Remove the design
        prices.presetDesigns.splice(designIndex, 1);
        prices.updatedBy = req.user._id;
        
        const savedPrices = await prices.save();
        
        res.status(200).json({
            status: "ok",
            message: "Preset design deleted successfully",
            data: savedPrices
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Error deleting preset design",
            error: error.message
        });
    }
};

module.exports = {
    getCustomizerPrices,
    updateCustomizerPrices,
    addPresetDesign,
    updatePresetDesign,
    deletePresetDesign
};
