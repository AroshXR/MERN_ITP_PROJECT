import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Outlet = () => {
    const [clothingItems, setClothingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({ q: "", category: "", brand: "", material: "", color: "", size: "", minPrice: "", maxPrice: "" });

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

    const fetchItems = async () => {
        try {
            setLoading(true);
            setError("");
            const params = {};
            Object.entries(filters).forEach(([k, v]) => { if (v !== "" && v != null) params[k] = v; });
            const res = await axios.get(`${API_BASE_URL}/clothing`, { params });
            setClothingItems(res.data || []);
        } catch (e) {
            setError("Failed to load items");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = (e) => {
        e.preventDefault();
        fetchItems();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="outlet-page">
            <h2>Outlet Clothing Items</h2>
            <form onSubmit={applyFilters} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', marginBottom: 16 }}>
                <input name="q" placeholder="Search" value={filters.q} onChange={handleChange} />
                <input name="category" placeholder="Category" value={filters.category} onChange={handleChange} />
                <input name="brand" placeholder="Brand" value={filters.brand} onChange={handleChange} />
                <input name="material" placeholder="Material" value={filters.material} onChange={handleChange} />
                <input name="color" placeholder="Color" value={filters.color} onChange={handleChange} />
                <input name="size" placeholder="Size" value={filters.size} onChange={handleChange} />
                <input name="minPrice" placeholder="Min Price" type="number" value={filters.minPrice} onChange={handleChange} />
                <input name="maxPrice" placeholder="Max Price" type="number" value={filters.maxPrice} onChange={handleChange} />
                <button type="submit">Apply</button>
                <button type="button" onClick={() => { setFilters({ q: "", category: "", brand: "", material: "", color: "", size: "", minPrice: "", maxPrice: "" }); setTimeout(fetchItems, 0); }}>Reset</button>
            </form>
            {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
            <div className="clothing-list">
                {clothingItems.length === 0 ? (
                    <p>No clothing items available.</p>
                ) : (
                    clothingItems.map((item) => (
                        <Link
                            to={`/outlet/${item._id}`}
                            key={item._id}
                            className="clothing-card-link"
                            style={{ textDecoration: "none", color: "inherit" }}
                        >
                            <div className="clothing-card">
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    style={{ width: "150px", height: "150px" }}
                                />
                                <h3>{item.name}</h3>
                                <p>{item.brand} {item.category}</p>
                                <p>{item.description}</p>
                                <p>
                                    <strong>Price:</strong> ${item.price}
                                </p>
                                {typeof item.rating === 'number' && <p>Rating: {item.rating.toFixed(1)} ({item.numReviews || 0})</p>}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Outlet;