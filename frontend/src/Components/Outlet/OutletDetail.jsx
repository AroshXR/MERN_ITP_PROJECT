import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

const OutletDetail = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${API_BASE_URL}/clothing/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load item");
                return res.json();
            })
            .then(data => setItem(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;
    if (!item) return <div>Not found</div>;

    return (
        <div className="outlet-detail">
            <img src={item.imageUrl} alt={item.name} style={{ width: 250, height: 250 }} />
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <p><strong>Price:</strong> ${item.price}</p>
            <p><strong>In stock:</strong> {item.stock}</p>
        </div>
    );
};

export default OutletDetail;


