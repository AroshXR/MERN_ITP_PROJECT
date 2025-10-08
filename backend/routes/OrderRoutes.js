const express = require("express");
const router = express.Router();

// Import order controller
const orderController = require("../controllers/OrderController");

// Import authentication middleware (if needed)
const { protect } = require("../middleware/auth");

// Order routes

// POST /orders - Create new order
router.post("/", orderController.createOrder);

// GET /orders - Get all orders (with optional query parameters)
// Query parameters: page, limit, AdminID
router.get("/", orderController.getAllOrders);

// GET /orders/my - Get orders for authenticated user
router.get("/my", protect, orderController.getMyOrders);

// GET /orders/statistics - Get order statistics
router.get("/statistics", orderController.getOrderStatistics);

// GET /orders/:id - Get order by ID (supports both OrderID and MongoDB _id)
router.get("/:id", orderController.getOrderById);

// DELETE /orders/:id - Delete order by ID
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
