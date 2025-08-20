import React, { useState } from "react";
import "./OrderSummery_tailor.css";
import print1 from "../clothing-customizer/customizer_preset_designs/print 1.jpg"

function OrderSummery_tailor() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);

  const handleFetchOrder = () => {
    if (!orderId) return alert("Please enter an order ID");

    // Simulated fetch from database (replace with actual API call)
    const mockData = {
      orderId,
      clothingType: "T-Shirt",
      size: "M",
      color: "#e74c3c",
      quantity: 1,
      design: "Custom Logo #456",
      imageUrl: print1,
    };

    setOrder(mockData);
  };

  return (
    <div className="summary-wrapper">
      <div className="summary-fetch">
        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="summary-input"
        />
        <button onClick={handleFetchOrder} className="summary-btn">
          Fetch Order
        </button>
      </div>

      {!order && <p className="summary-empty">No order details available</p>}

      {order && (
        <div className="summary-container">
          <h2 className="summary-title">Order Summary</h2>
          
          <div className="summary-card">
            <div className="summary-image">
              <img src={order.imageUrl} alt="Image Preview" />
            </div>

            <div className="summary-details">
              <p><strong>Clothing Type:</strong> {order.clothingType}</p>
              <p><strong>Size:</strong> {order.size}</p>
              <p>
                <strong>Color:</strong>{" "}
                <span
                  className="summary-color-box"
                  style={{ backgroundColor: order.color }}
                ></span>{" "}
                {order.color}
              </p>
              <p><strong>Quantity:</strong> {order.quantity}</p>
              {order.design && <p><strong>Design:</strong> {order.design}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderSummery_tailor;
