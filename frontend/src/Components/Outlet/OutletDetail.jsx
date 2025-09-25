import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

const OutletDetail = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [review, setReview] = useState({ rating: 5, comment: "", username: "" });
    const [submitting, setSubmitting] = useState(false);

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

    useEffect(() => { fetchItem(); }, [id]);

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!item) return <div>Not found</div>;

    const gallery = [item.imageUrl, ...(item.gallery || [])].filter(Boolean);

    return (
        <div className="outlet-detail" style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                    {gallery.length > 0 && (
                        <img src={gallery[0]} alt={item.name} style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        {gallery.slice(1).map((g, idx) => (
                            <img key={idx} src={g} alt={`g-${idx}`} style={{ width: 90, height: 90, objectFit: 'cover' }} />
                        ))}
                    </div>
                </div>
                <div>
                    <h2>{item.name}</h2>
                    <p>{item.brand} {item.category}</p>
                    <p>{item.material}</p>
                    <p>{item.description}</p>
                    <p><strong>Price:</strong> ${item.price}</p>
                    <p><strong>Stock:</strong> {item.stock}</p>
                    {Array.isArray(item.sizes) && item.sizes.length > 0 && <p><strong>Sizes:</strong> {item.sizes.join(', ')}</p>}
                    {Array.isArray(item.colors) && item.colors.length > 0 && <p><strong>Colors:</strong> {item.colors.join(', ')}</p>}
                    {typeof item.rating === 'number' && <p><strong>Rating:</strong> {item.rating.toFixed(1)} ({item.numReviews || 0})</p>}
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
    );
};

export default OutletDetail;


