const express = require('express');
const router = express.Router();
const {
    getItemReviews,
    createReview,
    updateReview,
    deleteReview,
    getAllReviews
} = require('../controllers/ReviewController');

// Public routes
router.get('/item/:itemId', getItemReviews); // Get reviews for a specific item

// Protected routes (require authentication)
router.post('/', createReview); // Create a new review
router.put('/:reviewId', updateReview); // Update a review
router.delete('/:reviewId', deleteReview); // Delete a review

// Admin routes
router.get('/admin/all', getAllReviews); // Get all reviews (admin only)

module.exports = router;
