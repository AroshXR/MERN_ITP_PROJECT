"use client";

import { useState } from "react";
import {CreditCard } from "lucide-react";
import "./PaymentManagement.css";

export default function PaymentManagement() {

    const [customerInfo, setCustomerInfo] = useState({
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        zipCode: "",
        phone: "",
    });

    const total = 0;

    const handlePlaceOrder = () => {
        alert("Order placed successfully!");
    };


    return (
        <div className="form-section">
            <div className="order-card">
                <div className="card-header">
                    <h2 className="card-title">
                        <CreditCard className="icon" />
                        Complete Your Order
                    </h2>
                </div>
                <div className="card-content">
                    <div className="form-grid">
                        {/* Shipping Info */}
                        <div className="form-group">
                            <h3 className="form-title">Shipping Information</h3>
                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        id="firstName"
                                        value={customerInfo.firstName}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="form-field">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        id="lastName"
                                        value={customerInfo.lastName}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-field">
                                <label htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={customerInfo.email}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                                />
                            </div>
                            <div className="form-field">
                                <label htmlFor="address">Address</label>
                                <input
                                    id="address"
                                    value={customerInfo.address}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="city">City</label>
                                    <input
                                        id="city"
                                        value={customerInfo.city}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                                    />
                                </div>
                                <div className="form-field">
                                    <label htmlFor="zipCode">ZIP Code</label>
                                    <input
                                        id="zipCode"
                                        value={customerInfo.zipCode}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, zipCode: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-field">
                                <label htmlFor="phone">Phone Number</label>
                                <input
                                    id="phone"
                                    value={customerInfo.phone}
                                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="form-group">
                            <h3 className="form-title">Payment Information</h3>
                            <div className="form-field">
                                <label htmlFor="cardNumber">Card Number</label>
                                <input id="cardNumber" placeholder="1234 5678 9012 3456" />
                            </div>
                            <div className="form-row">
                                <div className="form-field">
                                    <label htmlFor="expiry">Expiry Date</label>
                                    <input id="expiry" placeholder="MM/YY" />
                                </div>
                                <div className="form-field">
                                    <label htmlFor="cvv">CVV</label>
                                    <input id="cvv" placeholder="123" />
                                </div>
                            </div>
                            <div className="form-field">
                                <label htmlFor="cardName">Name on Card</label>
                                <input id="cardName" placeholder="John Doe" />
                            </div>
                        </div>
                    </div>

                    <div className="order-button-container">
                        <button
                            onClick={handlePlaceOrder}
                            className="order-button"
                        >
                            Place Order - ${total.toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}