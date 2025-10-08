const ClothingItem = require('../models/ClothingItemModel');
const Order = require('../models/OrderModel');

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

// Generate a report for selected clothing items
exports.report = async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required' });
    }

    const items = await ClothingItem.find({ _id: { $in: ids } });
    const data = items.map((it) => {
      const reviews = Array.isArray(it.reviews) ? it.reviews : [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews) : 0;
      const timeline = reviews
        .map(r => ({ date: r.createdAt, rating: r.rating, username: r.username || 'Anonymous', comment: r.comment || '' }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        _id: it._id,
        name: it.name,
        brand: it.brand,
        category: it.category,
        material: it.material,
        price: it.price,
        stock: it.stock,
        status: it.status,
        rating: Number.isFinite(it.rating) ? it.rating : averageRating,
        numReviews: it.numReviews || totalReviews,
        createdAt: it.createdAt,
        timeline,
      };
    });

    res.json({ count: data.length, data });
  } catch (err) {
    console.error('Error generating clothing report:', err);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

// Sales and revenue time series for selected clothing items
// Body: { ids: ["..."], startDate?: ISO, endDate?: ISO, granularity?: 'day'|'week'|'month', groupBy?: 'item' }
exports.salesTimeSeries = async (req, res) => {
  try {
    const { ids, startDate, endDate, granularity = 'day', groupBy } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'ids array is required' });
    }

    // Build match stage
    const match = { ItemID: { $in: ids } };
    if (startDate || endDate) {
      match.CreatedAt = {};
      if (startDate) match.CreatedAt.$gte = new Date(startDate);
      if (endDate) match.CreatedAt.$lte = new Date(endDate);
    }

    // Determine grouping key
    // Prefer $dateTrunc if available, fallback to $dateToString format
    let groupId;
    let sortKey;
    let projectDateExpr;
    if (["day", "week", "month"].includes(granularity)) {
      // Attempt to use $dateTrunc (MongoDB 5.0+)
      groupId = {
        $dateTrunc: {
          date: "$CreatedAt",
          unit: granularity,
          binSize: 1,
          timezone: 'UTC'
        }
      };
      sortKey = { _id: 1 };
      projectDateExpr = "$_id";
    } else {
      return res.status(400).json({ message: 'Invalid granularity. Use day, week, or month.' });
    }

    let responsePayload;
    if (groupBy === 'item') {
      // group by item and date bucket
      const pipeline = [
        { $match: match },
        {
          $group: {
            _id: { bucket: groupId, item: "$ItemID" },
            totalQuantity: { $sum: "$quantity" },
            totalRevenue: { $sum: "$Price" },
          }
        },
        { $sort: { "_id.bucket": 1, "_id.item": 1 } },
        {
          $project: {
            _id: 0,
            date: "$_id.bucket",
            itemId: "$_id.item",
            quantity: "$totalQuantity",
            revenue: { $round: ["$totalRevenue", 2] }
          }
        }
      ];

      const rows = await Order.aggregate(pipeline);
      // Map item names
      const uniqueIds = [...new Set(rows.map(r => r.itemId))];
      const items = await ClothingItem.find({ _id: { $in: uniqueIds } }, { name: 1, brand: 1 }).lean();
      const labelMap = new Map(items.map(it => [String(it._id), `${it.name}${it.brand ? ` (${it.brand})` : ''}`]));
      const grouped = new Map();
      for (const r of rows) {
        const key = String(r.itemId);
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push({ date: r.date, quantity: r.quantity, revenue: r.revenue });
      }
      responsePayload = {
        granularity,
        groupBy: 'item',
        series: Array.from(grouped.entries()).map(([itemId, data]) => ({
          itemId,
          label: labelMap.get(itemId) || itemId,
          data
        }))
      };
    } else {
      // combined totals
      const pipeline = [
        { $match: match },
        {
          $group: {
            _id: groupId,
            totalQuantity: { $sum: "$quantity" },
            totalRevenue: { $sum: "$Price" },
          }
        },
        { $sort: sortKey },
        {
          $project: {
            _id: 0,
            date: projectDateExpr,
            quantity: "$totalQuantity",
            revenue: { $round: ["$totalRevenue", 2] }
          }
        }
      ];

      const series = await Order.aggregate(pipeline);
      responsePayload = { granularity, data: series };
    }

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error('Error generating sales time series:', err);
    return res.status(500).json({ message: 'Failed to generate sales time series' });
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


