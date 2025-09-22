import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Outlet = () => {
    const [clothingItems, setClothingItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";
        fetch(`${API_BASE_URL}/clothing`)
            .then((res) => res.json())
            .then((data) => {
                setClothingItems(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="outlet-page">
            <h2>Outlet Clothing Items</h2>
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
                                <p>{item.description}</p>
                                <p>
                                    <strong>Price:</strong> ${item.price}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Outlet;