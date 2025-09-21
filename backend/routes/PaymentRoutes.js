const express = require("express");
const router = express.Router();

// Import payment controller
const paymentController = require("../controllers/PaymentController");

// Import validation middleware (if needed in the future)
// const { validatePaymentDetails } = require("../middleware/validation");

// Payment routes

// POST /payment - Create new payment details
router.post("/", paymentController.createPaymentDetails);

// GET /payment - Get all payment details (with optional query parameters)
// Query parameters: page, limit, status, userId
router.get("/", paymentController.getAllPaymentDetails);

// GET /payment/statistics - Get payment statistics
router.get("/statistics", paymentController.getPaymentStatistics);

// GET /payment/:id - Get payment details by ID
router.get("/:id", paymentController.getPaymentDetailsById);

// PATCH /payment/:id/status - Update payment status
router.patch("/:id/status", paymentController.updatePaymentStatus);

// DELETE /payment/:id - Delete payment details
router.delete("/:id", paymentController.deletePaymentDetails);

module.exports = router;
