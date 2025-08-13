"use client";

import { useState} from "react";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import "./OrderManagement.css";
import { useNavigate } from 'react-router-dom';

export default function OrderManagement() {
    const history = useNavigate();
    const [cartItems, setCartItems] = useState([
        {
            id: "1",
            name: "Classic White T-Shirt",
            price: 29.99,
            quantity: 2,
            size: "M",
            color: "White",
        },
        {
            id: "2",
            name: "Black Denim Jeans",
            price: 79.99,
            quantity: 1,
            size: "32",
            color: "Black",
        },
        {
            id: "3",
            name: "Striped Long Sleeve",
            price: 45.99,
            quantity: 1,
            size: "L",
            color: "Black/White",
        },
    ]);



    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems((items) => items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)));
    };

    const removeItem = (id) => {
        setCartItems((items) => items.filter((item) => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const handlePlaceOrder = () => {
        console.log('Placing order...', { cartItems, total });
        history("/paymentManagement")
    };

    return (
        <div className="order-management-container">
            <div className="order-content">
                <div className="order-header">
                    <h1 className="order-title">Review your items and complete your order</h1>
                </div>

                <div className="order-main">
                    {/* Cart Section */}
                    <div className="cart-section">
                        <div className="order-card">
                            <div className="card-header">
                                <h2 className="card-title">
                                     Shopping Cart ({cartItems.length} items)
                                </h2>
                            </div>
                            <div className="card-content">
                                {cartItems.length === 0 ? (
                                    <div className="empty-cart">
                                        <p>Your cart is empty</p>
                                    </div>
                                ) : (
                                    <div className="items-list">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="cart-item">
                                                <div className="item-info">
                                                    <h3 className="item-name">{item.name}</h3>
                                                    <p className="item-details">
                                                        Size: {item.size} | Color: {item.color}
                                                    </p>
                                                    <p className="item-price">${item.price.toFixed(2)}</p>
                                                </div>
                                                <div className="item-actions">
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="remove-button"
                                                    >
                                                        <Trash2 className="small-icon" />
                                                    </button>
                                                    <div className="quantity-controls">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="quantity-button"
                                                        >
                                                            <Minus className="small-icon" />
                                                        </button>
                                                        <span className="quantity-value">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="quantity-button"
                                                        >
                                                            <Plus className="small-icon" />
                                                        </button>
                                                    </div>
                                                    <p className="item-total">${(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {cartItems.length > 0 && (
                                    <div className="cart-footer">
                                        <div className="subtotal-row">
                                            <span>Subtotal:</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <button
                                            onClick={handlePlaceOrder}
                                            className="checkout-button"
                                        >
                                            Proceed to Payment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Section */}
                    <div className="summary-section">
                        <div className="order-card sticky-card">
                            <div className="card-header">
                                <h2 className="card-title">Order Summary</h2>
                            </div>
                            <div className="card-content">
                                <div className="summary-details">
                                    <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Shipping:</span>
                                        <span>${shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Tax:</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="divider"></div>
                                    <div className="summary-row total-row">
                                        <span>Total:</span>
                                        <span>${total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
    );
}