import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../NavBar/navBar";
import Footer from "../Footer/Footer";
import OutletCard from "./outletCard";
import FilterBar from "./FilterBar";

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

    return (
        <div className="outlet-page">
            <NavBar />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
                <h2>Outlet Clothing Items</h2>
                
                <FilterBar
                    filters={filters}
                    setFilters={setFilters}
                    onApply={fetchItems}
                    categoryOptions={CATEGORY_OPTIONS}
                    materialOptions={MATERIAL_OPTIONS}
                    colorOptions={COLOR_OPTIONS}
                    sizeOptions={SIZE_OPTIONS}
                />
                
                {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}
                
                {loading && (
                    <div style={{ 
                        padding: '20px', 
                        textAlign: 'center', 
                        color: '#6b7280',
                        fontSize: '14px',
                        fontWeight: 500
                    }}>
                        Loading items...
                    </div>
                )}
                
                {!loading && (
                    <div className="clothing-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                        {clothingItems.length === 0 ? (
                            <p>No clothing items available.</p>
                        ) : (
                            clothingItems.map((item) => (
                                <OutletCard key={item._id} item={item} />
                            ))
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};
export default Outlet;