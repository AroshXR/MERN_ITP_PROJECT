"use client";
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Loader2, Edit3 } from "lucide-react";
import "./OrderManagement.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../AuthGuard/AuthGuard';

export default function OrderManagement() {
    const history = useNavigate();
    const { isAuthenticated, getToken, logout, token } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Fetch cloth customizer data when the user is authenticated
    useEffect(() => {
        if (!token || !isAuthenticated()) {
            setCartItems([]);
            setLoading(false);
            setError('Please log in to view your cart.');
            return;
        }

        setError(null);
        fetchClothCustomizers();
    }, [token]);

    const fetchClothCustomizers = async (retryCount = 0) => {
        const authToken = getToken();

        if (!authToken) {
            setError('Authentication token not found. Please log in again.');
            setCartItems([]);
            setLoading(false);
            logout();
            history('/login');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get('http://localhost:5001/cloth-customizer', {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            if (response.data.status === "ok") {
                const transformedItems = response.data.data.map((item, index) => ({
                    id: item._id || `item-${index}`,
                    name: `Custom ${item.clothingType || 'Clothing'}`,
                    price: item.totalPrice && item.quantity ? (item.totalPrice / item.quantity) : (item.totalPrice || 0),
                    quantity: item.quantity || 1,
                    size: item.size || 'Standard',
                    color: item.color || 'Default',
                    clothingType: item.clothingType || 'tshirt',
                    selectedDesign: item.selectedDesign || null,
                    placedDesigns: item.placedDesigns || [],
                    customImage: item.customImage || null,
                    totalPrice: item.totalPrice || 0,
                    createdAt: item.createdAt || new Date().toISOString()
                }));

                setCartItems(transformedItems);
            } else {
                setCartItems([]);
                setError('Failed to fetch cart items');
            }
        } catch (error) {
            console.error('Error fetching cloth customizers:', error);

            if (error.response?.status === 401) {
                logout();
                setCartItems([]);
                setError('Your session has expired. Please log in again.');
                history('/login');
                return;
            }

            if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
                setError('Cannot connect to server. Please check your connection and try again.');
            } else if (retryCount < 3) {
                console.log(`Retrying... Attempt ${retryCount + 1}`);
                setTimeout(() => fetchClothCustomizers(retryCount + 1), 1000 * (retryCount + 1));
                return;
            } else {
                setError('Failed to load cart items. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (id, newQuantity) => {
        if (newQuantity < 1) return;
        if (!id) {
            console.error('Invalid item ID for update');
            alert('Invalid item ID. Please try again.');
            return;
        }

        try {
            const authToken = getToken();
            if (!authToken) {
                alert('Authentication token not found. Please log in again.');
                logout();
                history('/login');
                return;
            }

            const itemToUpdate = cartItems.find(item => item.id === id);
            if (!itemToUpdate) {
                console.error('Item not found for update:', id);
                alert('Item not found. Please refresh the page and try again.');
                return;
            }

            const newTotalPrice = (itemToUpdate.price * newQuantity);

            const response = await axios.put(`http://localhost:5001/cloth-customizer/${id}`, {
                quantity: newQuantity,
                totalPrice: newTotalPrice
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            console.log('Backend update response:', response.data);

            setCartItems((items) => items.map((item) =>
                item.id === id ? { ...item, quantity: newQuantity, totalPrice: newTotalPrice } : item
            ));
            showNotification('Quantity updated successfully!');
        } catch (error) {
            console.error('Error updating quantity:', error);
            console.error('Error details:', error.response?.data || error.message);

            if (error.response?.status === 401) {
                logout();
                alert('Your session has expired. Please log in again.');
                history('/login');
                return;
            }

            if (error.response?.status === 404) {
                alert('Item not found. It may have been removed. Please refresh the page.');
            } else if (error.response?.status === 500) {
                alert('Server error. Please try again later.');
            } else {
                alert('Failed to update quantity. Please try again.');
            }
        }
    };

    const removeItem = async (id) => {
        if (!id) {
            console.error('Invalid item ID for removal');
            alert('Invalid item ID. Please try again.');
            return;
        }

        const isConfirmed = window.confirm('Are you sure you want to remove this item from your cart?');
        if (!isConfirmed) return;

        try {
            const authToken = getToken();
            if (!authToken) {
                alert('Authentication token not found. Please log in again.');
                logout();
                history('/login');
                return;
            }

            const response = await axios.delete(`http://localhost:5001/cloth-customizer/${id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            console.log('Backend delete response:', response.data);

            setCartItems((items) => items.filter((item) => item.id !== id));
            showNotification('Item removed from cart successfully!');
        } catch (error) {
            console.error('Error removing item:', error);
            console.error('Error details:', error.response?.data || error.message);

            if (error.response?.status === 401) {
                logout();
                alert('Your session has expired. Please log in again.');
                history('/login');
                return;
            }

            if (error.response?.status === 404) {
                alert('Item not found. It may have been removed already. Please refresh the page.');
            } else if (error.response?.status === 500) {
                alert('Server error. Please try again later.');
            } else {
                alert('Failed to remove item. Please try again.');
            }
        }
    };

    const editItem = async (id) => {
        try {
            const authToken = getToken();
            if (!authToken) {
                alert('Authentication token not found. Please log in again.');
                logout();
                history('/login');
                return;
            }

            const response = await axios.get(`http://localhost:5001/cloth-customizer/${id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            if (response.data.status === "ok") {
                localStorage.setItem('editItemData', JSON.stringify(response.data.data));
                history('/customizer?edit=true');
            } else {
                alert('Failed to retrieve item data for editing.');
            }
        } catch (error) {
            console.error('Error retrieving item for editing:', error);

            if (error.response?.status === 401) {
                logout();
                alert('Your session has expired. Please log in again.');
                history('/login');
                return;
            }

            alert('Failed to retrieve item for editing. Please try again.');
        }
    };


    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = cartItems.length > 0 ? 9.99 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const handlePlaceOrder = () => {
        console.log('Placing order...', { cartItems, total });
        history("/paymentManagement");
    };

    if (loading) {
        return (
            <div className="order-management-container">
                <div className="order-content">
                    <div className="loading-container">
                        <Loader2 className="loading-spinner" />
                        <p>Loading your cart items...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-management-container">
                <NavBar />
                <div className="order-content">
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <button onClick={fetchClothCustomizers} className="retry-button">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <NavBar />
            <div className="order-management-container w-full min-h-screen flex flex-col">
                
                {/* Notification */}
                {notification && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                <div className="order-content">

                    <div className="order-header">
                        <h1 className="order-title">Order Management</h1>
                        <div className="order-actions">
                            <button
                                onClick={fetchClothCustomizers}
                                className="refresh-button"
                                disabled={loading}
                            >
                                {loading ? 'Refreshing...' : 'Refresh Cart'}
                            </button>
                            <span className="cart-status">
                                {cartItems.length > 0 ? `${cartItems.length} item(s) in cart` : 'Cart is empty'}
                            </span>
                        </div>
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
                                            <ShoppingBag className="empty-cart-icon" />
                                            <p>Your cart is empty</p>
                                            <p className="empty-cart-subtitle">Start customizing your clothing to see items here!</p>
                                            <button
                                                onClick={() => history('/customizer?edit=true')}
                                                className="start-customizing-button"
                                            >
                                                Start Customizing
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="items-list">
                                            {cartItems.map((item) => (
                                                <div key={item.id} className="cart-item">
                                                    <div className="item-info">
                                                        <h3 className="item-name">{item.name || `Custom ${item.clothingType || 'Clothing'}`}</h3>
                                                        <div className="item-details">
                                                            <p><strong>Size:</strong> {item.size || 'N/A'}</p>
                                                            <p><strong>Color:</strong> {item.color || 'N/A'}</p>
                                                            <p><strong>Type:</strong> {item.clothingType || 'N/A'}</p>
                                                            {item.selectedDesign && item.selectedDesign.name && (
                                                                <p><strong>Design:</strong> {item.selectedDesign.name}</p>
                                                            )}
                                                            {item.placedDesigns && item.placedDesigns.length > 0 && (
                                                                <p><strong>Designs Applied:</strong> {item.placedDesigns.length}</p>
                                                            )}
                                                            {item.selectedDesign?.isCustomUpload && (
                                                                <p><strong>Custom Image:</strong> Applied</p>
                                                            )}
                                                            {item.createdAt && (
                                                                <p><strong>Added:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
                                                            )}
                                                        </div>
                                                        <p className="item-price">${(item.price || 0).toFixed(2)} per item</p>
                                                    </div>
                                                    <div className="item-actions">
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="remove-button"
                                                            title="Remove item"
                                                        >
                                                            <Trash2 className="small-icon" />
                                                        </button>
                                                        <button
                                                            onClick={() => editItem(item.id)}
                                                            className="edit-button"
                                                            title="Edit item"
                                                        >
                                                            <Edit3 className="small-icon" />
                                                        </button>
                                                        <div className="quantity-controls">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                                                className="quantity-button"
                                                                disabled={(item.quantity || 1) <= 1}
                                                            >
                                                                <Minus className="small-icon" />
                                                            </button>
                                                            <span className="quantity-value">{item.quantity || 1}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                                                className="quantity-button"
                                                            >
                                                                <Plus className="small-icon" />
                                                            </button>
                                                        </div>
                                                        <p className="item-total">${(item.totalPrice || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {cartItems.length > 0 && (
                                        <div className="cart-footer">
                                            <div className="cart-summary">
                                                <div className="summary-row">
                                                    <span>Total Items:</span>
                                                    <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                                </div>
                                                <div className="subtotal-row">
                                                    <span>Subtotal:</span>
                                                    <span>${subtotal.toFixed(2)}</span>
                                                </div>
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
            <Footer />
        </div>

    );
}
