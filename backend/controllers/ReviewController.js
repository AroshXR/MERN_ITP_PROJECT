const Review = require('../models/Review');
const InventoryItem = require('../models/InventoryItem');

// Get reviews for a specific item
const getItemReviews = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        if (!itemId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid item ID format"
            });
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reviews = await Review.find({ itemId })
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ itemId });

        // Calculate average rating
        const avgRating = await Review.aggregate([
            { $match: { itemId: itemId } },
            { $group: { _id: null, avgRating: { $avg: "$rating" } } }
        ]);

        res.json({
            status: "ok",
            data: reviews,
            averageRating: avgRating.length > 0 ? avgRating[0].avgRating : 0,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalReviews: total,
                reviewsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch reviews",
            error: error.message
        });
    }
};

// Create a new review
const createReview = async (req, res) => {
    try {
        const { itemId, rating, title, comment } = req.body;
        const userId = req.user?.id; // Assuming user is authenticated

        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required"
            });
        }

        if (!itemId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid item ID format"
            });
        }

        // Check if item exists
        const item = await InventoryItem.findById(itemId);
        if (!item) {
            return res.status(404).json({
                status: "error",
                message: "Item not found"
            });
        }

        // Check if user already reviewed this item
        const existingReview = await Review.findOne({ itemId, userId });
        if (existingReview) {
            return res.status(400).json({
                status: "error",
                message: "You have already reviewed this item"
            });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                status: "error",
                message: "Rating must be between 1 and 5"
            });
        }

        const newReview = new Review({
            itemId,
            userId,
            username: req.user?.username || 'Anonymous',
            rating,
            title,
            comment
        });

        const savedReview = await newReview.save();

        res.status(201).json({
            status: "ok",
            message: "Review created successfully",
            data: savedReview
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to create review",
            error: error.message
        });
    }
};

// Update a review
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, title, comment } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required"
            });
        }

        if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid review ID format"
            });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                status: "error",
                message: "Review not found"
            });
        }

        // Check if user owns the review
        if (review.userId.toString() !== userId) {
            return res.status(403).json({
                status: "error",
                message: "You can only edit your own reviews"
            });
        }

        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            { rating, title, comment, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        res.json({
            status: "ok",
            message: "Review updated successfully",
            data: updatedReview
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to update review",
            error: error.message
        });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required"
            });
        }

        if (!reviewId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid review ID format"
            });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({
                status: "error",
                message: "Review not found"
            });
        }

        // Check if user owns the review or is admin
        if (review.userId.toString() !== userId && req.user?.type !== 'Admin') {
            return res.status(403).json({
                status: "error",
                message: "You can only delete your own reviews"
            });
        }

        await Review.findByIdAndDelete(reviewId);

        res.json({
            status: "ok",
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to delete review",
            error: error.message
        });
    }
};

// Get all reviews (admin only)
const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const reviews = await Review.find({})
            .populate('itemId', 'name')
            .populate('userId', 'username')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({});

        res.json({
            status: "ok",
            data: reviews,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalReviews: total,
                reviewsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch reviews",
            error: error.message
        });
    }
};

module.exports = {
    getItemReviews,
    createReview,
    updateReview,
    deleteReview,
    getAllReviews
};
