const PaymentDetails = require("../models/PaymentDetailsModel");
const Order = require("../models/OrderModel");

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

// Create new payment details
const createPaymentDetails = async (req, res) => {
  try {
    console.log("Creating payment details:", req.body);

    // Validate required fields
    const {
      deliveryDetails,
      shippingDetails,
      paymentDetails,
      orderDetails,
      giftMessage,
      userId
    } = req.body;

    // Check if all required sections are provided
    if (!deliveryDetails || !shippingDetails || !paymentDetails || !orderDetails) {
      return res.status(400).json({
        status: "error",
        message: "Missing required payment information. Please provide delivery, shipping, payment, and order details."
      });
    }

    // Validate delivery details
    const requiredDeliveryFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zipCode", "country"];
    for (const field of requiredDeliveryFields) {
      if (!deliveryDetails[field]) {
        return res.status(400).json({
          status: "error",
          message: `Missing required delivery field: ${field}`
        });
      }
    }

    // Validate shipping details
    if (!shippingDetails.method || shippingDetails.cost === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Missing required shipping information"
      });
    }

    // Validate payment details
    if (!paymentDetails.method) {
      return res.status(400).json({
        status: "error",
        message: "Payment method is required"
      });
    }

    // Validate order details
    const requiredOrderFields = ["subtotal", "tax", "total"];
    for (const field of requiredOrderFields) {
      if (orderDetails[field] === undefined) {
        return res.status(400).json({
          status: "error",
          message: `Missing required order field: ${field}`
        });
      }
    }

    // Create payment details object
    const paymentData = {
      deliveryDetails,
      shippingDetails,
      paymentDetails,
      orderDetails,
      giftMessage: giftMessage || "",
      userId: userId || null
    };

    // Create new payment details
    const newPaymentDetails = new PaymentDetails(paymentData);
    const savedPaymentDetails = await newPaymentDetails.save();

    console.log("Payment details saved successfully:", savedPaymentDetails._id);

    // Create orders for each cart item
    const createdOrders = [];
    console.log("Processing cart items for order creation:", orderDetails.cartItems?.length || 0);
    
    if (orderDetails.cartItems && orderDetails.cartItems.length > 0) {
      for (const item of orderDetails.cartItems) {
        console.log(`Processing cart item:`, {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          totalPrice: item.totalPrice
        });
        
        try {
          // Validate that the item ID is a valid ObjectId for DesignID
          if (!item.id || !item.id.match(/^[0-9a-fA-F]{24}$/)) {
            console.warn(`Skipping item with invalid ID: ${item.id} (not a valid ObjectId)`);
            continue;
          }
          
          console.log(`Valid ObjectId found for item: ${item.id}`);

          // Use the userId directly (it's already extracted from JWT in frontend)
          let userObjectId = userId;

          const orderData = {
            OrderID: generateOrderId(),
            quantity: item.quantity || 1,
            PaymentID: savedPaymentDetails._id.toString(),
            DesignID: item.id, // This should be a valid ObjectId from ClothCustomizer
            Price: item.totalPrice || item.price || 0,
            AdminID: userObjectId, // User who placed the order
            ItemID: item.id,
            CreatedAt: new Date()
          };

          console.log("Creating order with data:", orderData);
          
          const newOrder = new Order(orderData);
          const savedOrder = await newOrder.save();
          
          console.log("Order saved to database:", {
            _id: savedOrder._id,
            OrderID: savedOrder.OrderID,
            collection: 'orders'
          });
          createdOrders.push({
            orderId: savedOrder.OrderID,
            _id: savedOrder._id,
            itemName: item.name,
            quantity: savedOrder.quantity,
            price: savedOrder.Price
          });

          console.log("Order created successfully:", savedOrder.OrderID);
        } catch (orderError) {
          console.error("Error creating order for item:", item.id, orderError.message);
          // Continue with other items even if one fails
        }
      }
    }

    res.status(201).json({
      status: "ok",
      message: "Payment details and orders saved successfully",
      data: {
        paymentId: savedPaymentDetails._id,
        status: savedPaymentDetails.status,
        total: savedPaymentDetails.orderDetails.total,
        createdAt: savedPaymentDetails.createdAt,
        orders: createdOrders,
        totalOrders: createdOrders.length
      }
    });

  } catch (error) {
    console.error("Error creating payment details:", error);
    
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
        message: "Payment details with this information already exists"
      });
    }

    res.status(500).json({
      status: "error",
      message: "Internal server error while saving payment details"
    });
  }
};

// Get all payment details
const getAllPaymentDetails = async (req, res) => {
  try {
    console.log("Fetching all payment details");

    const { page = 1, limit = 10, status, userId } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    // Get payment details with pagination
    const paymentDetails = await PaymentDetails.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "firstName lastName email")
      .lean();

    // Get total count
    const total = await PaymentDetails.countDocuments(query);

    console.log(`Found ${paymentDetails.length} payment details`);

    res.status(200).json({
      status: "ok",
      message: "Payment details retrieved successfully",
      data: paymentDetails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching payment details"
    });
  }
};

// Get payment details by ID
const getPaymentDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching payment details for ID:", id);

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment ID format"
      });
    }

    const paymentDetails = await PaymentDetails.findById(id)
      .populate("userId", "firstName lastName email")
      .lean();

    if (!paymentDetails) {
      return res.status(404).json({
        status: "error",
        message: "Payment details not found"
      });
    }

    console.log("Payment details found:", paymentDetails._id);

    res.status(200).json({
      status: "ok",
      message: "Payment details retrieved successfully",
      data: paymentDetails
    });

  } catch (error) {
    console.error("Error fetching payment details by ID:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching payment details"
    });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log("Updating payment status for ID:", id, "to:", status);

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment ID format"
      });
    }

    // Validate status
    const validStatuses = ["pending", "processing", "completed", "cancelled", "failed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const updatedPayment = await PaymentDetails.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    ).populate("userId", "firstName lastName email");

    if (!updatedPayment) {
      return res.status(404).json({
        status: "error",
        message: "Payment details not found"
      });
    }

    console.log("Payment status updated successfully:", updatedPayment._id);

    res.status(200).json({
      status: "ok",
      message: "Payment status updated successfully",
      data: {
        paymentId: updatedPayment._id,
        status: updatedPayment.status,
        updatedAt: updatedPayment.updatedAt
      }
    });

  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while updating payment status"
    });
  }
};

// Delete payment details
const deletePaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting payment details for ID:", id);

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid payment ID format"
      });
    }

    const deletedPayment = await PaymentDetails.findByIdAndDelete(id);

    if (!deletedPayment) {
      return res.status(404).json({
        status: "error",
        message: "Payment details not found"
      });
    }

    console.log("Payment details deleted successfully:", deletedPayment._id);

    res.status(200).json({
      status: "ok",
      message: "Payment details deleted successfully",
      data: {
        paymentId: deletedPayment._id,
        deletedAt: new Date()
      }
    });

  } catch (error) {
    console.error("Error deleting payment details:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while deleting payment details"
    });
  }
};

// Get payment statistics
const getPaymentStatistics = async (req, res) => {
  try {
    console.log("Fetching payment statistics");

    const stats = await PaymentDetails.aggregate([
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalRevenue: { $sum: "$orderDetails.total" },
          averageOrderValue: { $avg: "$orderDetails.total" },
          statusCounts: {
            $push: "$status"
          }
        }
      }
    ]);

    // Calculate status distribution
    const statusDistribution = {};
    if (stats.length > 0 && stats[0].statusCounts) {
      stats[0].statusCounts.forEach(status => {
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      });
    }

    const result = stats.length > 0 ? {
      totalPayments: stats[0].totalPayments || 0,
      totalRevenue: stats[0].totalRevenue || 0,
      averageOrderValue: Math.round((stats[0].averageOrderValue || 0) * 100) / 100,
      statusDistribution
    } : {
      totalPayments: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      statusDistribution: {}
    };

    console.log("Payment statistics calculated:", result);

    res.status(200).json({
      status: "ok",
      message: "Payment statistics retrieved successfully",
      data: result
    });

  } catch (error) {
    console.error("Error fetching payment statistics:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error while fetching payment statistics"
    });
  }
};

module.exports = {
  createPaymentDetails,
  getAllPaymentDetails,
  getPaymentDetailsById,
  updatePaymentStatus,
  deletePaymentDetails,
  getPaymentStatistics
};
