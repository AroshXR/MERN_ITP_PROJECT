"use client";
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import { useState, useEffect, useMemo } from "react";
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
    const [searchQuery, setSearchQuery] = useState("");

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    // Filter items for display based on search
    const filteredItems = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return cartItems;
        return cartItems.filter((item) => {
            const fields = [
                item.name,
                item.clothingType,
                item.color,
                item.size,
                item.selectedDesign?.name,
                ...(Array.isArray(item.placedDesigns) ? item.placedDesigns.map(d => d?.name) : []),
                item.createdAt && new Date(item.createdAt).toLocaleString(),
                item.quantity,
                item.price,
                item.totalPrice,
            ];
            return fields.filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
        });
    }, [cartItems, searchQuery]);

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
                    name: item.nickname || `Custom ${item.clothingType || 'Clothing'}`,
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
                // Merge outlet items from localStorage
                const raw = localStorage.getItem('outletCart');
                const outletItems = raw ? JSON.parse(raw) : [];
                const mappedOutlet = Array.isArray(outletItems) ? outletItems.map((oi, idx) => ({
                    id: `outlet-${oi._id || idx}`,
                    source: 'outlet',
                    name: oi.name || 'Outlet Item',
                    price: Number(oi.price) || 0,
                    quantity: Number(oi.quantity) || 1,
                    imageUrl: oi.imageUrl || null,
                    size: oi.size || 'N/A',
                    color: oi.color || 'N/A',
                    clothingType: oi.category || 'clothing',
                    totalPrice: (Number(oi.price) || 0) * (Number(oi.quantity) || 1),
                    createdAt: oi.createdAt || new Date().toISOString(),
                    // Booking-specific fields
                    type: oi.type || 'outlet',
                    bookingId: oi.bookingId || null,
                    rentalPeriod: oi.rentalPeriod || null,
                    location: oi.location || null
                })) : [];

                setCartItems([...transformedItems, ...mappedOutlet]);
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

            // Even if API fails, still load localStorage items (bookings, outlet items)
            const raw = localStorage.getItem('outletCart');
            const outletItems = raw ? JSON.parse(raw) : [];
            const mappedOutlet = Array.isArray(outletItems) ? outletItems.map((oi, idx) => ({
                id: `outlet-${oi._id || idx}`,
                source: 'outlet',
                name: oi.name || 'Outlet Item',
                price: Number(oi.price) || 0,
                quantity: Number(oi.quantity) || 1,
                imageUrl: oi.imageUrl || null,
                size: oi.size || 'N/A',
                color: oi.color || 'N/A',
                clothingType: oi.category || 'clothing',
                totalPrice: (Number(oi.price) || 0) * (Number(oi.quantity) || 1),
                createdAt: oi.createdAt || new Date().toISOString(),
                // Booking-specific fields
                type: oi.type || 'outlet',
                bookingId: oi.bookingId || null,
                rentalPeriod: oi.rentalPeriod || null,
                location: oi.location || null
            })) : [];

            if (mappedOutlet.length > 0) {
                setCartItems(mappedOutlet);
                setError(null); // Clear error if we have localStorage items
            } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
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
            const isOutlet = String(id).startsWith('outlet-');
            const itemToUpdate = cartItems.find(item => item.id === id);
            if (!itemToUpdate) {
                console.error('Item not found for update:', id);
                alert('Item not found. Please refresh the page and try again.');
                return;
            }

            const newTotalPrice = (itemToUpdate.price * newQuantity);

            if (isOutlet) {
                // Update localStorage cart
                const raw = localStorage.getItem('outletCart');
                const cart = raw ? JSON.parse(raw) : [];
                const underlyingId = String(id).replace('outlet-', '');
                const idx = cart.findIndex(ci => String(ci._id) === underlyingId);
                if (idx >= 0) {
                    cart[idx].quantity = newQuantity;
                    cart[idx].totalPrice = newTotalPrice;
                    localStorage.setItem('outletCart', JSON.stringify(cart));
                }
                setCartItems((items) => items.map((item) =>
                    item.id === id ? { ...item, quantity: newQuantity, totalPrice: newTotalPrice } : item
                ));
                showNotification('Quantity updated successfully!');
                return;
            }

            // Backend update for cloth-customizer items
            const authToken = getToken();
            if (!authToken) {
                alert('Authentication token not found. Please log in again.');
                logout();
                history('/login');
                return;
            }

            await axios.put(`http://localhost:5001/cloth-customizer/${id}`, {
                quantity: newQuantity,
                totalPrice: newTotalPrice
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

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
            const isOutlet = String(id).startsWith('outlet-');
            if (isOutlet) {
                const underlyingId = String(id).replace('outlet-', '');
                const raw = localStorage.getItem('outletCart');
                const cart = raw ? JSON.parse(raw) : [];
                const next = cart.filter(ci => String(ci._id) !== underlyingId);
                localStorage.setItem('outletCart', JSON.stringify(next));
                setCartItems((items) => items.filter((item) => item.id !== id));
                showNotification('Item removed from cart successfully!');
                return;
            }

            const authToken = getToken();
            if (!authToken) {
                alert('Authentication token not found. Please log in again.');
                logout();
                history('/login');
                return;
            }

            await axios.delete(`http://localhost:5001/cloth-customizer/${id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

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
    const total = subtotal;

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
            <div className="order-management-container">

                {/* Notification */}
                {notification && (
                    <div className={`notificationNt ${notification.type}`}>
                        {notification.message}
                    </div>
                )}

                <div className="order-content">

                    <div className="order-header">
                        <h1 className="order-title">Order Management</h1>
                        <div className="order-actions">
                            <input
                                type="text"
                                className="order-search-input"
                                placeholder="Search your items by nickname"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search cart items"
                            />
                            <button
                                onClick={fetchClothCustomizers}
                                className="refresh-button"
                                disabled={loading}
                            >
                                {loading ? 'Refreshing...' : 'Refresh Cart'}
                            </button>
                            <span className="cart-status">
                                {cartItems.length > 0
                                    ? `${filteredItems.length}${searchQuery ? ` / ${cartItems.length}` : ''} item(s) visible`
                                    : 'Cart is empty'}
                            </span>
                        </div>
                    </div>

                    <div className="order-main">
                        {/* Cart Section */}
                        <div className="cart-section">
                                <div className="order-card">
                                    <div className="card-header">
                                        <h2 className="card-title">
                                            Shopping Cart ({filteredItems.length}{searchQuery ? ` / ${cartItems.length}` : ''} items)
                                        </h2>
                                    </div>
                                <div className="card-content">
                                    {cartItems.length === 0 ? (
                                        <div className="empty-cart">
                                            <ShoppingBag className="empty-cart-icon" />
                                            <p>Your cart is empty</p>
                                            <p className="empty-cart-subtitle">Start customizing your clothing to see items here!</p>
                                            <button
                                                onClick={() => history('/customizer')}
                                                className="start-customizing-button"
                                            >
                                                Start Customizing
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="items-list">
                                            {filteredItems.length === 0 ? (
                                                <div className="empty-cart">
                                                    <p>No items match your search.</p>
                                                    <p className="empty-cart-subtitle">Try a different keyword or clear the search.</p>
                                                </div>
                                            ) : (
                                                filteredItems.map((item) => (
                                                <div key={item.id} className="cart-item">
                                                    {/* Display image for booking items */}
                                                    {item.type === 'booking' && item.imageUrl && (
                                                        <div style={{marginRight: '15px', flexShrink: 0}}>
                                                            <img 
                                                                src={item.imageUrl} 
                                                                alt={item.name}
                                                                style={{
                                                                    width: '120px',
                                                                    height: '120px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #e0e0e0'
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="item-info">
                                                        <h3 className="item-name">
                                                            {item.name || `Custom ${item.clothingType || 'Clothing'}`}
                                                            {item.type === 'booking' && (
                                                                <span style={{
                                                                    marginLeft: '10px',
                                                                    padding: '2px 8px',
                                                                    fontSize: '11px',
                                                                    backgroundColor: '#4CAF50',
                                                                    color: 'white',
                                                                    borderRadius: '4px',
                                                                    fontWeight: 'normal'
                                                                }}>
                                                                    Rental Booking
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <div className="item-details">
                                                            {/* Show booking-specific info if it's a booking item */}
                                                            {item.type === 'booking' && item.rentalPeriod ? (
                                                                <>
                                                                    <p><strong>Type:</strong> Outfit Rental</p>
                                                                    <p><strong>Rental Period:</strong> {item.rentalPeriod.from} to {item.rentalPeriod.to}</p>
                                                                    {item.location && (
                                                                        <p><strong>Pickup Location:</strong> {item.location}</p>
                                                                    )}
                                                                    <p><strong>Category:</strong> {item.clothingType || 'N/A'}</p>
                                                                    {item.createdAt && (
                                                                        <p><strong>Added to Cart:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <p><strong>Size:</strong> {item.size || 'N/A'}</p>
                                                                    {/* <p><strong>Color:</strong> {item.color || 'N/A'}</p> */}
                                                                    <div className="color-preview">
                                                                        <div
                                                                            className="color-palette"
                                                                            style={{
                                                                                backgroundColor: item.color,
                                                                                width: "24px",
                                                                                height: "24px",
                                                                                borderRadius: "50%",
                                                                                border: "1px solid #ccc",
                                                                            }}
                                                                            title={item.color}
                                                                        />
                                                                    </div>
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
                                                                        <p><strong>Added:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                                                                    )}
                                                                </>
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
                                                        {/* Hide edit button for booking items */}
                                                        {item.type !== 'booking' && (
                                                            <button
                                                                onClick={() => editItem(item.id)}
                                                                className="edit-button"
                                                                title="Edit item"
                                                            >
                                                                <Edit3 className="small-icon" />
                                                            </button>
                                                        )}
                                                        {/* Disable quantity controls for booking items */}
                                                        {item.type !== 'booking' ? (
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
                                                        ) : (
                                                            <div className="quantity-controls">
                                                                <span className="quantity-value" style={{padding: '0 20px'}}>Qty: {item.quantity || 1}</span>
                                                            </div>
                                                        )}
                                                        <p className="item-total">${(item.totalPrice || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                ))
                                            )}
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
