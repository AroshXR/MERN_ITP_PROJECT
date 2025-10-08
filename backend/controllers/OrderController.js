const Order = require("../models/OrderModel");
const PaymentDetails = require("../models/PaymentDetailsModel");

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Create new order
const createOrder = async (req, res) => {
  try {
    console.log("Creating order:", req.body);

    const {
      quantity,
      PaymentID,
      DesignID,
      Price,
      AdminID,
      ItemID
    } = req.body;

    // Validate required fields
    if (!quantity || !PaymentID || !DesignID || !Price || !AdminID || !ItemID) {
      return res.status(400).json({
        status: "error",
        message: "Missing required order information. Please provide quantity, PaymentID, DesignID, Price, AdminID, and ItemID."
      });
    }

    // Validate data types
    if (isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        status: "error",
        message: "Quantity must be a positive number"
      });
    }

    if (isNaN(Price) || Price < 0) {
      return res.status(400).json({
        status: "error",
        message: "Price must be a non-negative number"
      });
    }

    // Generate unique order ID
    const OrderID = generateOrderId();

    // Create order object
    const orderData = {
      OrderID,
      quantity: parseInt(quantity),
      PaymentID,
      DesignID,
      Price: parseFloat(Price),
      AdminID,
      ItemID,
      CreatedAt: new Date()
    };

    // Create new order
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    console.log("Order saved successfully:", savedOrder.OrderID);

    res.status(201).json({
      status: "ok",
      message: "Order created successfully",
      data: {
        orderId: savedOrder.OrderID,
        _id: savedOrder._id,
        quantity: savedOrder.quantity,
        price: savedOrder.Price,
        createdAt: savedOrder.CreatedAt
      }
    });

  } catch (error) {
    console.error("Error creating order:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "Order with this ID already exists"
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error while creating order"
    });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    console.log("Fetching all orders");

    const { page = 1, limit = 10, AdminID } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (AdminID) query.AdminID = AdminID;

    // Get orders with pagination
    const orders = await Order.find(query)
      .sort({ CreatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("DesignID", "clothingType color size selectedDesign")
      .populate("AdminID", "firstName lastName email")
      .lean();

    // Get total count
    const total = await Order.countDocuments(query);

    console.log(`Found ${orders.length} orders`);

    res.status(200).json({
      status: "ok",
      message: "Orders retrieved successfully",
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching orders"
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching order for ID:", id);

    // Try to find by OrderID first, then by MongoDB _id
    let order = await Order.findOne({ OrderID: id })
      .populate("DesignID", "clothingType color size selectedDesign totalPrice")
      .populate("AdminID", "firstName lastName email")
      .lean();

    // If not found by OrderID, try by MongoDB _id
    if (!order && id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id)
        .populate("DesignID", "clothingType color size selectedDesign totalPrice")
        .populate("AdminID", "firstName lastName email")
        .lean();
    }

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }

    console.log("Order found:", order.OrderID);

    res.status(200).json({
      status: "ok",
      message: "Order retrieved successfully",
      data: order
    });

  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching order"
    });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting order for ID:", id);

    // Try to find by OrderID first, then by MongoDB _id
    let deletedOrder = await Order.findOneAndDelete({ OrderID: id });

    // If not found by OrderID, try by MongoDB _id
    if (!deletedOrder && id.match(/^[0-9a-fA-F]{24}$/)) {
      deletedOrder = await Order.findByIdAndDelete(id);
    }

    if (!deletedOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }

    console.log("Order deleted successfully:", deletedOrder.OrderID);

    res.status(200).json({
      status: "ok",
      message: "Order deleted successfully",
      data: {
        orderId: deletedOrder.OrderID,
        deletedAt: new Date()
      }
    });

  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while deleting order"
    });
  }
};

// Get order statistics
const getOrderStatistics = async (req, res) => {
  try {
    console.log("Fetching order statistics");

    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$Price" },
          averageOrderValue: { $avg: "$Price" },
          totalQuantity: { $sum: "$quantity" }
        }
      }
    ]);

    const result = stats.length > 0 ? {
      totalOrders: stats[0].totalOrders || 0,
      totalRevenue: Math.round((stats[0].totalRevenue || 0) * 100) / 100,
      averageOrderValue: Math.round((stats[0].averageOrderValue || 0) * 100) / 100,
      totalQuantity: stats[0].totalQuantity || 0
    } : {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      totalQuantity: 0
    };

    console.log("Order statistics calculated:", result);

    res.status(200).json({
      status: "ok",
      message: "Order statistics retrieved successfully",
      data: result
    });

  } catch (error) {
    console.error("Error fetching order statistics:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching order statistics"
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  deleteOrder,
  getOrderStatistics
};

// Get orders for the authenticated user
// Note: Uses req.user injected by auth middleware
const getMyOrders = async (req, res) => {
  try {
    console.log('[getMyOrders] Incoming request');
    if (!req.user || !req.user._id) {
      console.log('[getMyOrders] No authenticated user on request');
      return res.status(401).json({ status: 'error', message: 'Not authenticated' });
    }

    const userId = req.user._id;
    console.log('[getMyOrders] Authenticated user:', String(userId));
    // Also include orders linked through PaymentDetails.userId
    const paymentDocs = await PaymentDetails.find({ userId }).select('_id').lean();
    console.log('[getMyOrders] Found payment docs:', paymentDocs.length);
    const paymentIds = paymentDocs.map(p => String(p._id));

    const query = paymentIds.length
      ? { $or: [ { AdminID: userId }, { PaymentID: { $in: paymentIds } } ] }
      : { AdminID: userId };
    console.log('[getMyOrders] Query:', JSON.stringify(query));

    const orders = await Order.find(query)
      .sort({ CreatedAt: -1 })
      .populate('DesignID', 'clothingType color size selectedDesign totalPrice')
      .lean();
    console.log('[getMyOrders] Orders found:', orders.length);

    return res.status(200).json({
      status: 'ok',
      message: 'User orders retrieved successfully',
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error while fetching user orders' });
  }
};

module.exports.getMyOrders = getMyOrders;
