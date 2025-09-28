import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../NavBar/navBar";
import Footer from "../Footer/Footer";
import OutletCard from "./outletCard";

const Outlet = () => {
    const [clothingItems, setClothingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({ q: "", category: "", brand: "", material: "", color: "", size: "", minPrice: "", maxPrice: "" });

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

    // Predefined options (keep in sync with ClothingInventoryManagement)
    const CATEGORY_OPTIONS = [
        'T-Shirts','Shirts','Pants','Jeans','Shorts','Dresses','Skirts','Jackets','Coats','Sweaters','Hoodies','Suits','Accessories'
    ];
    const MATERIAL_OPTIONS = [
        'Cotton','Linen','Silk','Wool','Polyester','Denim','Leather','Rayon','Nylon','Viscose'
    ];
    const COLOR_OPTIONS = [
        'Black','White','Grey','Blue','Navy','Red','Green','Yellow','Pink','Purple','Brown','Beige','Maroon','Orange'
    ];
    const SIZE_OPTIONS = ['S','M','L','XL','XXL'];

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
        // Basic validation
        const min = Number(filters.minPrice);
        const max = Number(filters.maxPrice);
        if ((filters.minPrice !== '' && (isNaN(min) || min < 0)) || (filters.maxPrice !== '' && (isNaN(max) || max < 0))) {
            alert('Prices must be non-negative numbers');
            return;
        }
        if (filters.minPrice !== '' && filters.maxPrice !== '' && min > max) {
            alert('Min price cannot be greater than Max price');
            return;
        }
        fetchItems();
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="outlet-page">
            {/* <NavBar /> */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
                <h2>Outlet clothing Items</h2>
                <form onSubmit={applyFilters} style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', marginBottom: 16 }}>
                    <input name="q" placeholder="Search" value={filters.q} onChange={handleChange} />
                    <select name="category" value={filters.category} onChange={handleChange}>
                        <option value="">All Categories</option>
                        {CATEGORY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <input name="brand" placeholder="Brand" value={filters.brand} onChange={handleChange} />
                    <select name="material" value={filters.material} onChange={handleChange}>
                        <option value="">All Materials</option>
                        {MATERIAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <select name="color" value={filters.color} onChange={handleChange}>
                        <option value="">All Colors</option>
                        {COLOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <select name="size" value={filters.size} onChange={handleChange}>
                        <option value="">All Sizes</option>
                        {SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <input name="minPrice" placeholder="Min Price" type="number" min={0} value={filters.minPrice} onChange={handleChange} />
                    <input name="maxPrice" placeholder="Max Price" type="number" min={0} value={filters.maxPrice} onChange={handleChange} />
                    <button type="submit">Apply</button>
                    <button type="button" onClick={() => { setFilters({ q: "", category: "", brand: "", material: "", color: "", size: "", minPrice: "", maxPrice: "" }); setTimeout(fetchItems, 0); }}>Reset</button>
                </form>
                {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}
                <div className="clothing-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                    {clothingItems.length === 0 ? (
                        <p>No clothing items available.</p>
                    ) : (
                        clothingItems.map((item) => (
                            <OutletCard key={item._id} item={item} />
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};
export default Outlet;