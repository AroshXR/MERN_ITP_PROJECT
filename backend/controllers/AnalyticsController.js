const Order = require('../models/OrderModel');
const ClothingItem = require('../models/ClothingItemModel');
const Applicant = require('../models/ApplicantModel');

// Get overview analytics (revenue, orders, AOV)
const getOverviewAnalytics = async (req, res) => {
  try {
    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Count total orders
    const totalOrders = await Order.countDocuments({ status: { $ne: 'cancelled' } });

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100
    });
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({ error: 'Failed to fetch overview analytics' });
  }
};

// Get stock analytics
const getStockAnalytics = async (req, res) => {
  try {
    // Get total items count
    const totalItems = await ClothingItem.countDocuments();

    // Calculate total stock value
    const stockResult = await ClothingItem.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$price', '$stock'] } } } }
    ]);
    const totalValue = stockResult.length > 0 ? stockResult[0].totalValue : 0;

    // Count low stock items (stock < 10)
    const lowStockCount = await ClothingItem.countDocuments({ stock: { $lt: 10, $gt: 0 } });

    // Count out of stock items
    const outOfStockCount = await ClothingItem.countDocuments({ stock: 0 });

    res.json({
      totalItems,
      totalValue: Math.round(totalValue * 100) / 100,
      lowStockCount,
      outOfStockCount
    });
  } catch (error) {
    console.error('Error fetching stock analytics:', error);
    res.status(500).json({ error: 'Failed to fetch stock analytics' });
  }
};

// Get recent orders
const getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const orders = await Order.find({ status: { $ne: 'cancelled' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email');

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
};

// Get recent applications
const getRecentApplications = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const applicants = await Applicant.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ applicants });
  } catch (error) {
    console.error('Error fetching recent applications:', error);
    res.status(500).json({ error: 'Failed to fetch recent applications' });
  }
};

module.exports = {
  getOverviewAnalytics,
  getStockAnalytics,
  getRecentOrders,
  getRecentApplications
};
