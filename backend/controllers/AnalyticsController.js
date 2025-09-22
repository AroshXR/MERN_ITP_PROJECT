const mongoose = require('mongoose');

async function getOverview(req, res) {
  try {
    const PaymentDetails = mongoose.model('PaymentDetails');
    const Order = mongoose.model('Order');

    const payments = await PaymentDetails.aggregate([
      { $match: { status: { $in: ["processing", "completed"] } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$orderDetails.total" },
          ordersCount: { $sum: 1 },
          avgOrderValue: { $avg: "$orderDetails.total" }
        }
      }
    ]);

    const summary = payments[0] || { revenue: 0, ordersCount: 0, avgOrderValue: 0 };

    const recentOrders = await Order.find().sort({ CreatedAt: -1 }).limit(5).select({ OrderID: 1, Price: 1, quantity: 1, CreatedAt: 1 });

    return res.status(200).json({
      status: 'ok',
      data: {
        revenue: summary.revenue || 0,
        ordersCount: summary.ordersCount || 0,
        avgOrderValue: summary.avgOrderValue || 0,
        recentOrders
      }
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to load overview analytics' });
  }
}

async function getStock(req, res) {
  try {
    const ClothingItem = mongoose.model('ClothingItem');

    const items = await ClothingItem.find().select({ name: 1, stock: 1, price: 1, imageUrl: 1, category: 1 });

    const totalStock = items.reduce((sum, item) => sum + (item.stock || 0), 0);
    const stockValue = items.reduce((sum, item) => sum + (item.stock || 0) * (item.price || 0), 0);
    const lowStock = items.filter(i => (i.stock || 0) <= 5);

    return res.status(200).json({
      status: 'ok',
      data: {
        totalStock,
        stockValue,
        lowStock,
        items
      }
    });
  } catch (err) {
    console.error('Analytics stock error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to load stock analytics' });
  }
}

module.exports = { getOverview, getStock };


