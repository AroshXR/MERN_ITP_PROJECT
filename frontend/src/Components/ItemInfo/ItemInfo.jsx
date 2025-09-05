import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import axios from 'axios';
import { useAuth } from '../../AuthGuard/authGuard';
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Star as StarIcon } from 'lucide-react';
import './ItemInfo.css';

const ItemInfo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, currentUser } = useAuth();
    
    const [item, setItem] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        comment: ''
    });

    useEffect(() => {
        fetchItemDetails();
        fetchReviews();
    }, [id]);

    const fetchItemDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5001/inventory/${id}`);
            if (response.data.status === 'ok') {
                setItem(response.data.data);
                if (response.data.data.color.length > 0) {
                    setSelectedColor(response.data.data.color[0]);
                }
                if (response.data.data.size.length > 0) {
                    setSelectedSize(response.data.data.size[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching item details:', error);
            setError('Failed to fetch item details');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await axios.get(`http://localhost:5001/reviews/item/${id}`);
            if (response.data.status === 'ok') {
                setReviews(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        if (!selectedColor) {
            alert('Please select a color');
            return;
        }
        if (quantity < 1) {
            alert('Please select a valid quantity');
            return;
        }

        // This will integrate with the existing cart system
        // For now, we'll just show an alert
        alert(`Added ${quantity} ${item.name} to cart!`);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated()) {
            alert('Please log in to submit a review');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5001/reviews', {
                itemId: id,
                rating: reviewForm.rating,
                title: reviewForm.title,
                comment: reviewForm.comment
            });

            if (response.data.status === 'ok') {
                setShowReviewForm(false);
                setReviewForm({ rating: 5, title: '', comment: '' });
                fetchReviews();
                alert('Review submitted successfully!');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review: ' + (error.response?.data?.message || error.message));
        }
    };

    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return (total / reviews.length).toFixed(1);
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <StarIcon
                    key={i}
                    size={16}
                    fill={i <= rating ? '#ffc107' : 'none'}
                    color="#ffc107"
                />
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="item-info-container">
                <NavBar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading item details...</p>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="item-info-container">
                <NavBar />
                <div className="error-container">
                    <p className="error-message">{error || 'Item not found'}</p>
                    <button onClick={() => navigate('/outlet')} className="back-btn">
                        Back to Outlet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="item-info-container">
            <NavBar />
            <div className="item-info-content">
                <div className="breadcrumb">
                    <button onClick={() => navigate('/outlet')} className="back-btn">
                        <ArrowLeft size={20} />
                        Back to Outlet
                    </button>
                </div>

                <div className="item-details-section">
                    {/* Image Gallery */}
                    <div className="item-gallery">
                        <div className="main-image">
                            <img src={item.imageUrl} alt={item.name} />
                        </div>
                        <div className="image-thumbnails">
                            <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="thumbnail active"
                                onClick={() => setActiveImage(0)}
                            />
                            {/* Add more images here if available */}
                        </div>
                    </div>

                    {/* Item Information */}
                    <div className="item-info">
                        <div className="item-header">
                            <h1>{item.name}</h1>
                            <p className="item-brand">by {item.brand}</p>
                            <div className="item-rating">
                                {renderStars(parseFloat(calculateAverageRating()))}
                                <span className="rating-text">
                                    {calculateAverageRating()} ({reviews.length} reviews)
                                </span>
                            </div>
                        </div>

                        <div className="item-price">
                            <span className="price">${item.price}</span>
                            {item.stock > 0 ? (
                                <span className="stock-status in-stock">In Stock ({item.stock} available)</span>
                            ) : (
                                <span className="stock-status out-of-stock">Out of Stock</span>
                            )}
                        </div>

                        <div className="item-description">
                            <h3>Description</h3>
                            <p>{item.description}</p>
                            {item.material && (
                                <p><strong>Material:</strong> {item.material}</p>
                            )}
                        </div>

                        {/* Color Selection */}
                        <div className="selection-group">
                            <h3>Color</h3>
                            <div className="color-options">
                                {item.color.map((color, index) => (
                                    <button
                                        key={index}
                                        className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color.toLowerCase() }}
                                        onClick={() => setSelectedColor(color)}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div className="selection-group">
                            <h3>Size</h3>
                            <div className="size-options">
                                {item.size.map((size, index) => (
                                    <button
                                        key={index}
                                        className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity Selection */}
                        <div className="selection-group">
                            <h3>Quantity</h3>
                            <div className="quantity-selector">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                    className="quantity-btn"
                                >
                                    -
                                </button>
                                <span className="quantity-value">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(item.stock, quantity + 1))}
                                    disabled={quantity >= item.stock}
                                    className="quantity-btn"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                className="add-to-cart-btn"
                                onClick={handleAddToCart}
                                disabled={item.stock === 0}
                            >
                                <ShoppingCart size={20} />
                                Add to Cart
                            </button>
                            <button className="wishlist-btn">
                                <Heart size={20} />
                                Wishlist
                            </button>
                            <button className="share-btn">
                                <Share2 size={20} />
                                Share
                            </button>
                        </div>

                        {/* Additional Info */}
                        <div className="additional-info">
                            <div className="info-item">
                                <strong>Category:</strong> {item.category}
                            </div>
                            <div className="info-item">
                                <strong>SKU:</strong> {item._id.slice(-8)}
                            </div>
                            <div className="info-item">
                                <strong>Added:</strong> {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="reviews-section">
                    <div className="reviews-header">
                        <h2>Customer Reviews</h2>
                        <div className="reviews-summary">
                            <div className="average-rating">
                                <span className="rating-number">{calculateAverageRating()}</span>
                                <div className="rating-stars">
                                    {renderStars(parseFloat(calculateAverageRating()))}
                                </div>
                                <span className="total-reviews">Based on {reviews.length} reviews</span>
                            </div>
                            {isAuthenticated() && (
                                <button
                                    className="write-review-btn"
                                    onClick={() => setShowReviewForm(true)}
                                >
                                    Write a Review
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Review Form */}
                    {showReviewForm && (
                        <div className="review-form-container">
                            <h3>Write a Review</h3>
                            <form onSubmit={handleSubmitReview} className="review-form">
                                <div className="form-group">
                                    <label>Rating</label>
                                    <div className="rating-input">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewForm({...reviewForm, rating: star})}
                                                className={`star-btn ${reviewForm.rating >= star ? 'active' : ''}`}
                                            >
                                                <Star size={24} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={reviewForm.title}
                                        onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                                        required
                                        maxLength={100}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Comment</label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                        required
                                        maxLength={500}
                                        rows={4}
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" onClick={() => setShowReviewForm(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit">Submit Review</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="reviews-list">
                        {reviews.length === 0 ? (
                            <p className="no-reviews">No reviews yet. Be the first to review this item!</p>
                        ) : (
                            reviews.map((review) => (
                                <div key={review._id} className="review-item">
                                    <div className="review-header">
                                        <div className="reviewer-info">
                                            <span className="reviewer-name">{review.username}</span>
                                            <div className="review-rating">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <span className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="review-title">{review.title}</h4>
                                    <p className="review-comment">{review.comment}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ItemInfo;
