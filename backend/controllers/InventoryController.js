const InventoryItem = require('../models/InventoryItem');

// Get all inventory items (with optional filters)
const getAllItems = async (req, res) => {
    try {
        const { 
            category, 
            minPrice, 
            maxPrice, 
            size, 
            color, 
            search, 
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            page = 1,
            limit = 12
        } = req.query;

        // Build filter object
        const filter = { isActive: true };
        
        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (size) filter.size = { $in: Array.isArray(size) ? size : [size] };
        if (color) filter.color = { $in: Array.isArray(color) ? color : [color] };
        if (search) {
            filter.$text = { $search: search };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const items = await InventoryItem.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await InventoryItem.countDocuments(filter);

        res.json({
            status: "ok",
            data: items,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch inventory items",
            error: error.message
        });
    }
};

// Get all items for admin (including inactive)
const getAllItemsAdmin = async (req, res) => {
    try {
        const items = await InventoryItem.find({}).sort({ createdAt: -1 });
        res.json({
            status: "ok",
            data: items
        });
    } catch (error) {
        console.error('Error fetching inventory items for admin:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch inventory items",
            error: error.message
        });
    }
};

// Get single item by ID
const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid item ID format"
            });
        }

        const item = await InventoryItem.findById(id);
        
        if (!item) {
            return res.status(404).json({
                status: "error",
                message: "Item not found"
            });
        }

        res.json({
            status: "ok",
            data: item
        });
    } catch (error) {
        console.error('Error fetching item by ID:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch item",
            error: error.message
        });
    }
};

// Create new item
const createItem = async (req, res) => {
    try {
        const itemData = req.body;
        
        // Validate required fields
        const requiredFields = ['name', 'description', 'price', 'category', 'size', 'color', 'stock', 'imageUrl', 'brand'];
        for (const field of requiredFields) {
            if (!itemData[field]) {
                return res.status(400).json({
                    status: "error",
                    message: `${field} is required`
                });
            }
        }

        const newItem = new InventoryItem(itemData);
        const savedItem = await newItem.save();

        res.status(201).json({
            status: "ok",
            message: "Item created successfully",
            data: savedItem
        });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to create item",
            error: error.message
        });
    }
};

// Update item
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid item ID format"
            });
        }

        const updatedItem = await InventoryItem.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({
                status: "error",
                message: "Item not found"
            });
        }

        res.json({
            status: "ok",
            message: "Item updated successfully",
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to update item",
            error: error.message
        });
    }
};

// Delete item (soft delete by setting isActive to false)
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid item ID format"
            });
        }

        const deletedItem = await InventoryItem.findByIdAndUpdate(
            id,
            { isActive: false, updatedAt: Date.now() },
            { new: true }
        );

        if (!deletedItem) {
            return res.status(404).json({
                status: "error",
                message: "Item not found"
            });
        }

        res.json({
            status: "ok",
            message: "Item deleted successfully",
            data: deletedItem
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to delete item",
            error: error.message
        });
    }
};

// Update stock
const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid item ID format"
            });
        }

        if (stock < 0) {
            return res.status(400).json({
                status: "error",
                message: "Stock cannot be negative"
            });
        }

        const updatedItem = await InventoryItem.findByIdAndUpdate(
            id,
            { stock, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({
                status: "error",
                message: "Item not found"
            });
        }

        res.json({
            status: "ok",
            message: "Stock updated successfully",
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to update stock",
            error: error.message
        });
    }
};

module.exports = {
    getAllItems,
    getAllItemsAdmin,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    updateStock
};
