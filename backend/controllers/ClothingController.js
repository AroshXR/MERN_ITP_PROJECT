const ClothingItem = require('../models/ClothingItemModel');

// Get all clothing items
exports.getAll = async (req, res) => {
  try {
    const items = await ClothingItem.find().sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching clothing items:', err);
    return res.status(500).json({ message: 'Failed to fetch clothing items' });
  }
};

// Get clothing item by id
exports.getById = async (req, res) => {
  try {
    const item = await ClothingItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(200).json(item);
  } catch (err) {
    console.error('Error fetching clothing item:', err);
    return res.status(500).json({ message: 'Failed to fetch clothing item' });
  }
};

// Create new clothing item
exports.create = async (req, res) => {
  try {
    const item = new ClothingItem(req.body);
    const saved = await item.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating clothing item:', err);
    return res.status(400).json({ message: 'Failed to create clothing item', error: err.message });
  }
};

// Update clothing item
exports.update = async (req, res) => {
  try {
    const updated = await ClothingItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating clothing item:', err);
    return res.status(400).json({ message: 'Failed to update clothing item', error: err.message });
  }
};

// Delete clothing item
exports.remove = async (req, res) => {
  try {
    const deleted = await ClothingItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    return res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    console.error('Error deleting clothing item:', err);
    return res.status(500).json({ message: 'Failed to delete clothing item' });
  }
};


