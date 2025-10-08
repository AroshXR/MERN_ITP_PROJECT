import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../AuthGuard/AuthGuard";
import NavBar from "../NavBar/navBar";
import Footer from "../Footer/Footer";
import "./Outlet.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

const OutletDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const { isAuthenticated, getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [review, setReview] = useState({ rating: 5, comment: "", username: "" });
    const [submitting, setSubmitting] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    // Selection state
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");

    const fetchItem = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get(`${API_BASE_URL}/clothing/${id}`);
            setItem(res.data);
        } catch (e) {
            setError("Failed to load item");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchItem();
        setSelectedImageIndex(0);
    }, [id]);

    // Initialize default selections when item loads
    useEffect(() => {
        if (item) {
            if (Array.isArray(item.sizes) && item.sizes.length > 0) {
                setSelectedSize(prev => prev || item.sizes[0]);
            }
            if (Array.isArray(item.colors) && item.colors.length > 0) {
                setSelectedColor(prev => prev || item.colors[0]);
            }
        }
    }, [item]);

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await axios.post(`${API_BASE_URL}/clothing/${id}/reviews`, {
                rating: Number(review.rating),
                comment: review.comment,
                username: review.username || "Anonymous"
            });
            setReview({ rating: 5, comment: "", username: "" });
            await fetchItem();
        } catch (e) {
            alert("Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddToCart = async () => {
        if (!item) return;
        try {
            // Use localStorage cart consistently (no backend /cart route configured)
            const raw = localStorage.getItem('outletCart');
            const cart = raw ? JSON.parse(raw) : [];
            const existingIndex = cart.findIndex(ci => ci._id === item._id);
            if (existingIndex >= 0) {
                cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
                cart[existingIndex].totalPrice = (cart[existingIndex].quantity) * (cart[existingIndex].price || 0);
                // Preserve existing size/color if already present; otherwise set if available
                if (!cart[existingIndex].size && selectedSize) cart[existingIndex].size = selectedSize;
                if (!cart[existingIndex].color && selectedColor) cart[existingIndex].color = selectedColor;
            } else {
                cart.push({
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    imageUrl: item.imageUrl,
                    totalPrice: item.price,
                    size: selectedSize || null,
                    color: selectedColor || null
                });
            }
            localStorage.setItem('outletCart', JSON.stringify(cart));
            // Navigate user to cart page
            navigate('/orderManagement');
        } catch (err) {
            console.error('Failed to add to cart', err);
            alert('Failed to add to cart');
        }
    };

    const handleBuyNow = () => {
        if (!item) return;
        try {
            const payload = {
                id: item._id,
                name: item.name,
                price: item.price,
                quantity: 1,
                imageUrl: item.imageUrl,
                totalPrice: item.price,
                size: selectedSize || null,
                color: selectedColor || null,
            };
            sessionStorage.setItem('directPurchase', JSON.stringify(payload));
        } catch (_) {}
        navigate('/paymentManagement');
    };

    if (loading) return <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!item) return <div>Not found</div>;

    const gallery = [item.imageUrl, ...(item.gallery || [])].filter(Boolean);

    return (
        <div className="outlet-detail">
            <NavBar />
            <div style={{ display: 'grid', gap: 16, maxWidth: 1200, margin: '0 auto', padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                    {gallery.length > 0 && (
                        <img src={gallery[selectedImageIndex]} alt={item.name} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 8 }} />
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        {gallery.map((g, idx) => (
                            <img 
                                key={idx} 
                                src={g} 
                                alt={`g-${idx}`} 
                                onClick={() => setSelectedImageIndex(idx)}
                                style={{ 
                                    width: 88, 
                                    height: 88, 
                                    objectFit: 'cover', 
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    border: idx === selectedImageIndex ? '2px solid #2c5aa0' : '1px solid #e5e7eb',
                                    boxShadow: idx === selectedImageIndex ? '0 0 0 3px rgba(44,90,160,0.15)' : 'none'
                                }} 
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <h2 style={{ marginBottom: 4 }}>{item.name}</h2>
                    <p style={{ color: '#6b7280', margin: 0 }}>{item.brand} {item.category}</p>
                    <p style={{ color: '#6b7280', marginTop: 8 }}>{item.material}</p>
                    {item.description && <p style={{ marginTop: 8 }}>{item.description}</p>}
                    <p style={{ marginTop: 8 }}><strong>Price:</strong> ${item.price} {item.stock === 0 && <span style={{ marginLeft: 8, color: '#b91c1c', fontWeight: 600 }}>(Out of Stock)</span>}</p>
                    <p><strong>Stock:</strong> {item.stock}</p>
                    {/* Size & Color selectors */}
                    {Array.isArray(item.sizes) && item.sizes.length > 0 && (
                        <div style={{ margin: '8px 0' }}>
                            <label htmlFor="size-select"><strong>Size:</strong></label>
                            <select
                                id="size-select"
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                                style={{ marginLeft: 8 }}
                            >
                                {item.sizes.map((s, i) => (
                                    <option key={i} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {Array.isArray(item.colors) && item.colors.length > 0 && (
                        <div style={{ margin: '8px 0' }}>
                            <label htmlFor="color-select"><strong>Color:</strong></label>
                            <select
                                id="color-select"
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                                style={{ marginLeft: 8 }}
                            >
                                {item.colors.map((c, i) => (
                                    <option key={i} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {typeof item.rating === 'number' && <p><strong>Rating:</strong> {item.rating.toFixed(1)} ({item.numReviews || 0})</p>}

                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        <button onClick={handleAddToCart} disabled={item.stock === 0} style={{ padding: '10px 16px', borderRadius: 6, border: '1px solid #ddd', cursor: item.stock === 0 ? 'not-allowed' : 'pointer', background: item.stock === 0 ? '#f3f4f6' : '#fff', opacity: item.stock === 0 ? 0.6 : 1 }}>Add to Cart</button>
                        <button onClick={handleBuyNow} disabled={item.stock === 0} style={{ padding: '10px 16px', borderRadius: 6, border: 'none', background: item.stock === 0 ? '#9ca3af' : '#2c5aa0', color: '#fff', cursor: item.stock === 0 ? 'not-allowed' : 'pointer', opacity: item.stock === 0 ? 0.8 : 1 }}>Buy Now</button>
                    </div>
                </div>
            </div>

            <div>
                <h3>Reviews</h3>
                {(!item.reviews || item.reviews.length === 0) && <p>No reviews yet.</p>}
                <div style={{ display: 'grid', gap: 8 }}>
                    {(item.reviews || []).slice().reverse().map((r, idx) => (
                        <div key={idx} style={{ border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
                            <p><strong>{r.username || 'Anonymous'}</strong> - {new Date(r.createdAt).toLocaleString()}</p>
                            <p>Rating: {r.rating}/5</p>
                            {r.comment && <p>{r.comment}</p>}
                        </div>
                    ))}
                </div>

                <form onSubmit={submitReview} style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                    <h4>Add a review (anonymous allowed)</h4>
                    <input placeholder="Your name (optional)" value={review.username} onChange={e => setReview(prev => ({ ...prev, username: e.target.value }))} />
                    <select value={review.rating} onChange={e => setReview(prev => ({ ...prev, rating: e.target.value }))}>
                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
                    </select>
                    <textarea placeholder="Your comment (optional)" value={review.comment} onChange={e => setReview(prev => ({ ...prev, comment: e.target.value }))} />
                    <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                </form>
            </div>
            </div>
            <Footer />
        </div>
    );
};

export default OutletDetail;


