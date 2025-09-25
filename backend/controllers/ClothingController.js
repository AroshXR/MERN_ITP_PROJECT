const ClothingItem = require('../models/ClothingItemModel');

exports.getAll = async (req, res) => {
  try {
    const { status = 'active', q, category, brand, material, color, size, minPrice, maxPrice } = req.query;
    const query = {};
    if (status) query.status = status;
    if (q) query.name = { $regex: q, $options: 'i' };
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (material) query.material = material;
    if (color) query.colors = { $in: [color] };
    if (size) query.sizes = { $in: [size] };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    const items = await ClothingItem.find(query).sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (err) {
    console.error('Error fetching clothing items:', err);
    return res.status(500).json({ message: 'Failed to fetch clothing items' });
  }
};

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

exports.addReview = async (req, res) => {
  try {
    const { rating, comment, username, userId } = req.body;
    if (!rating) return res.status(400).json({ message: 'Rating is required' });
    const item = await ClothingItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.reviews.push({ rating, comment: comment || '', username: username || 'Anonymous', userId: userId || null });
    item.numReviews = item.reviews.length;
    item.rating = item.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / (item.numReviews || 1);
    await item.save();
    return res.status(201).json({ message: 'Review added', reviews: item.reviews, rating: item.rating, numReviews: item.numReviews });
  } catch (err) {
    console.error('Error adding review:', err);
    return res.status(500).json({ message: 'Failed to add review' });
  }
};


