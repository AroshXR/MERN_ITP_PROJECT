import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthGuard/AuthGuard';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import './UserAccount.css';

const UserAccount = () => {
    const navigate = useNavigate();
    const { currentUser, logout, updateStoredUser, refreshAuth, getToken } = useAuth();

    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState('');
    const [profileMessage, setProfileMessage] = useState('');
    const [saveInProgress, setSaveInProgress] = useState(false);
    const [deleteInProgress, setDeleteInProgress] = useState(false);

    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsError, setNotificationsError] = useState('');
    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const [expandedNotifications, setExpandedNotifications] = useState(new Set());

    // Orders state
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState('');

    // Bookings state
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [bookingsError, setBookingsError] = useState('');

    const [formState, setFormState] = useState({
        username: '',
        email: '',
        address: '',
        phoneNumber: ''
    });

    const userId = useMemo(() => currentUser?.id || currentUser?._id, [currentUser]);

    const applyProfile = (userData) => {
        if (!userData) {
            return;
        }

        setProfile(userData);
        setFormState({
            username: userData.username || '',
            email: userData.email || '',
            address: userData.address || '',
            phoneNumber: userData.phoneNumber || ''
        });
        // identity verification removed
    };

    // Load authenticated user's orders
    const fetchMyOrders = async () => {
        if (!userId) return;
        setOrdersLoading(true);
        setOrdersError('');
        try {
            const token = typeof getToken === 'function' ? getToken() : null;
            const response = await axios.get('http://localhost:5001/orders/my', {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined
            });
            // Controller returns { status:'ok', data:[...] }
            const list = Array.isArray(response.data?.data)
                ? response.data.data
                : Array.isArray(response.data?.orders)
                    ? response.data.orders
                    : Array.isArray(response.data)
                        ? response.data
                        : [];
            // Newest first already sorted by backend; keep safety sort
            list.sort((a, b) => new Date(b.CreatedAt || b.createdAt) - new Date(a.CreatedAt || a.createdAt));
            // If empty, try fallback via AdminID query
            if (!list.length) {
                try {
                    const fallback = await axios.get(`http://localhost:5001/orders`, {
                        params: { AdminID: userId },
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined
                    });
                    const fallbackList = Array.isArray(fallback.data?.data)
                        ? fallback.data.data
                        : Array.isArray(fallback.data?.orders)
                            ? fallback.data.orders
                            : Array.isArray(fallback.data)
                                ? fallback.data
                                : [];
                    fallbackList.sort((a, b) => new Date(b.CreatedAt || b.createdAt) - new Date(a.CreatedAt || a.createdAt));
                    setOrders(fallbackList);
                } catch (fbErr) {
                    console.error('Fallback /orders?AdminID failed:', fbErr);
                    setOrders(list);
                }
            } else {
                setOrders(list);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
            // If unauthorized, try fallback without /my
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                try {
                    const token = typeof getToken === 'function' ? getToken() : null;
                    const fallback = await axios.get(`http://localhost:5001/orders`, {
                        params: { AdminID: userId },
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined
                    });
                    const fallbackList = Array.isArray(fallback.data?.data)
                        ? fallback.data.data
                        : Array.isArray(fallback.data?.orders)
                            ? fallback.data.orders
                            : Array.isArray(fallback.data)
                                ? fallback.data
                                : [];
                    fallbackList.sort((a, b) => new Date(b.CreatedAt || b.createdAt) - new Date(a.CreatedAt || a.createdAt));
                    setOrders(fallbackList);
                    setOrdersError('');
                } catch (fbErr) {
                    console.error('Fallback /orders?AdminID failed:', fbErr);
                    setOrdersError(fbErr.response?.data?.message || error.response?.data?.message || 'Unable to load your orders.');
                }
            } else {
                setOrdersError(error.response?.data?.message || 'Unable to load your orders.');
            }
        } finally {
            setOrdersLoading(false);
        }
    };

    // Load authenticated user's bookings
    const fetchMyBookings = async () => {
        if (!userId) return;
        setBookingsLoading(true);
        setBookingsError('');
        try {
            const token = typeof getToken === 'function' ? getToken() : null;
            const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
            
            const response = await axios.get(`${BASE_URL}/api/booking/user`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined
            });
            
            if (response.data?.success) {
                // Filter only confirmed bookings for the profile page
                const confirmedBookings = response.data.bookings.filter(booking => booking.status === 'confirmed');
                // Sort by creation date, newest first
                confirmedBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBookings(confirmedBookings);
            } else {
                setBookingsError('Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Failed to load bookings:', error);
            setBookingsError(error.response?.data?.message || 'Unable to load your bookings.');
        } finally {
            setBookingsLoading(false);
        }
    };

    // Reusable notifications loader
    const fetchNotifications = async () => {
        if (!userId) return;
        setNotificationsLoading(true);
        setNotificationsError('');
        try {
            const response = await axios.get(`http://localhost:5001/users/${userId}/notifications`);
            if (response.data?.status === 'ok') {
                const list = Array.isArray(response.data.notifications) ? response.data.notifications : [];
                // Sort newest first for clarity
                list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setNotifications(list);
            } else {
                setNotificationsError(response.data?.message || 'Unable to load notifications');
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            setNotificationsError('Unable to load notifications.');
        } finally {
            setNotificationsLoading(false);
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            if (!userId) {
                return;
            }

            setProfileLoading(true);
            setProfileError('');

            try {
                const response = await axios.get('http://localhost:5001/users/me');
                if (response.data?.status === 'ok') {
                    applyProfile(response.data.user);
                    updateStoredUser(response.data.user);
                } else {
                    setProfileError(response.data?.message || 'Unable to load profile');
                }
            } catch (error) {
                console.error('Failed to load user profile:', error);
                setProfileError('Unable to load profile. Please try again later.');
            } finally {
                setProfileLoading(false);
            }
        };

        loadProfile();
        fetchNotifications();
        fetchMyOrders();
        fetchMyBookings();
        // Poll every 15s while on this page to reflect new notifications automatically
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    useEffect(() => {
        if (!profileMessage) {
            return;
        }
        const timer = setTimeout(() => setProfileMessage(''), 4000);
        return () => clearTimeout(timer);
    }, [profileMessage]);

    // identity verification feedback removed

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = async (event) => {
        event.preventDefault();

        if (!userId) {
            return;
        }

        const hasChanges = profile ? (
            formState.username !== (profile.username || '') ||
            formState.email !== (profile.email || '') ||
            formState.address !== (profile.address || '') ||
            formState.phoneNumber !== (profile.phoneNumber || '')
        ) : true;

        if (!hasChanges) {
            setSaveInProgress(false);
            setProfileMessage('No changes to save');
            return;
        }

        setSaveInProgress(true);
        setProfileError('');
        setProfileMessage('');

        try {
            const response = await axios.put('http://localhost:5001/users/me', {
                username: formState.username,
                email: formState.email,
                address: formState.address,
                phoneNumber: formState.phoneNumber
            });

            if (response.data?.status === 'ok') {
                applyProfile(response.data.user);
                updateStoredUser(response.data.user);
                setProfileMessage('Profile updated successfully');
                await refreshAuth();
            } else {
                setProfileError(response.data?.message || 'Unable to update profile');
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            if (error.response?.data?.message) {
                setProfileError(error.response.data.message);
            } else {
                setProfileError('Something went wrong while updating your profile.');
            }
        } finally {
            setSaveInProgress(false);
        }
    };

    const handleAccountDelete = async () => {
        if (!userId) {
            return;
        }
        const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!confirmed) {
            return;
        }

        setDeleteInProgress(true);
        try {
            const response = await axios.delete('http://localhost:5001/users/me');
            if (response.data?.status === 'ok') {
                logout();
                navigate('/');
            } else {
                setProfileError(response.data?.message || 'Unable to delete account');
            }
        } catch (error) {
            console.error('Account deletion failed:', error);
            setProfileError('Failed to delete account. Please try again later.');
        } finally {
            setDeleteInProgress(false);
        }
    };

    // identity verification handlers removed

    const handleNotificationToggle = async (notificationId, read) => {
        if (!userId || !notificationId) {
            return;
        }

        try {
            await axios.patch(`http://localhost:5001/users/${userId}/notifications/${notificationId}`, { read });
            await fetchNotifications();
        } catch (error) {
            console.error('Failed to update notification:', error);
        }
    };

    const handleNotificationDelete = async (notificationId) => {
        if (!userId || !notificationId) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5001/users/${userId}/notifications/${notificationId}`);
            await fetchNotifications();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const toggleNotificationExpansion = (notificationId) => {
        setExpandedNotifications(prev => {
            const newSet = new Set(prev);
            if (newSet.has(notificationId)) {
                newSet.delete(notificationId);
            } else {
                newSet.add(notificationId);
            }
            return newSet;
        });
    };

    if (!currentUser) {
        return null;
    }

    return (
        <div className="user-account-page">
            <NavBar />
            <main className="user-account-content">
                <header className="user-account-header">
                    <div>
                        <h1>
                            <i className="bx bx-user-circle"></i> Your Account
                            {unreadCount > 0 && (
                                <span className="header-notification-indicator">
                                    <i className="bx bx-bell"></i> {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </h1>
                    </div>
                    <div className="header-nav-actions">
                        <button
                            type="button"
                            className="header-nav-btn secondary"
                            onClick={() => navigate(-1)}
                        >
                            <i className="bx bx-arrow-back"></i> Back
                        </button>
                        <button
                            type="button"
                            className="header-nav-btn primary"
                            onClick={() => navigate('/userHome')}
                        >
                            Next <i className="bx bx-arrow-forward"></i>
                        </button>
                    </div>
                    {/* identity status badge removed */}
                </header>
                <p className="account-subtitle">Manage your profile and notifications.</p>

                {profileLoading ? (
                    <section className="panel">
                        <p>Loading your profile...</p>
                    </section>
                ) : profileError ? (
                    <section className="panel error">
                        <p>{profileError}</p>
                    </section>
                ) : (
                    <section className="panel">
                        <h2>Profile Details</h2>
                        <form className="form-grid" onSubmit={handleProfileSave}>
                            <label>
                                <span>Username</span>
                                <input
                                    type="text"
                                    name="username"
                                    value={formState.username}
                                    onChange={handleFormChange}
                                    required
                                />
                            </label>
                            <label>
                                <span>Email</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formState.email}
                                    onChange={handleFormChange}
                                    required
                                />
                            </label>
                            <label>
                                <span>Address</span>
                                <input
                                    type="text"
                                    name="address"
                                    value={formState.address}
                                    onChange={handleFormChange}
                                    required
                                />
                            </label>
                            <label>
                                <span>Phone Number</span>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formState.phoneNumber}
                                    onChange={handleFormChange}
                                    placeholder="Optional"
                                />
                            </label>
                            <label>
                                <span>Account Type</span>
                                <input type="text" value={profile?.type || ''} disabled />
                            </label>
                            {/* identity submission info removed */}
                            {profileMessage && <p className="form-feedback success">{profileMessage}</p>}
                            {profileError && <p className="form-feedback error">{profileError}</p>}
                            <br />
                            <div className="form-actions">
                                <button type="submit" className="primary-btn" disabled={saveInProgress}>
                                    {saveInProgress ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    className="danger"
                                    onClick={handleAccountDelete}
                                    disabled={deleteInProgress}
                                >
                                    {deleteInProgress ? 'Deleting...' : 'Delete Account'}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                {/* Identity Verification section removed */}

                <section className="panel">
                    <div className="panel-header">
                        <h2>
                            <i className="bx bx-bell"></i> Notifications
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </h2>
                        <div className="panel-header__right">
                            <span className="notification-summary">
                                <strong>{unreadCount}</strong> unread | <strong>{notifications.length}</strong> total
                            </span>
                            <button
                                type="button"
                                className="header-nav-btn secondary"
                                onClick={fetchNotifications}
                                disabled={notificationsLoading}
                            >
                                <i className="bx bx-refresh"></i>
                                {notificationsLoading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                    {notificationsLoading ? (
                        <p>Loading notifications...</p>
                    ) : notificationsError ? (
                        <p className="form-feedback error">{notificationsError}</p>
                    ) : notifications.length === 0 ? (
                        <p className="empty-state">You do not have any notifications yet.</p>
                    ) : (
                        <ul className="notification-list">
                            {notifications.map((notification) => (
                                <li key={notification._id} className={`notification ${notification.read ? 'read' : 'unread'} ${notification.level || 'info'}`}>
                                    <div className="notification-content">
                                        <div className="notification-icon">
                                            {notification.level === 'success' && <i className="bx bx-check-circle"></i>}
                                            {notification.level === 'error' && <i className="bx bx-error-circle"></i>}
                                            {(!notification.level || notification.level === 'info') && <i className="bx bx-info-circle"></i>}
                                        </div>
                                        <div className="notification-text">
                                            <div className="notification-message">
                                                {(() => {
                                                    const lines = notification.message.split('\n');
                                                    const isLong = lines.length > 5;
                                                    const isExpanded = expandedNotifications.has(notification._id);
                                                    const displayLines = isLong && !isExpanded ? lines.slice(0, 3) : lines;

                                                    return (
                                                        <>
                                                            {displayLines.map((line, index) => (
                                                                <p key={index} className={line.trim() === '' ? 'line-break' : ''}>
                                                                    {line.trim() === '' ? '\u00A0' : line}
                                                                </p>
                                                            ))}
                                                            {isLong && !isExpanded && (
                                                                <p className="notification-truncated">...</p>
                                                            )}
                                                            {isLong && (
                                                                <button
                                                                    type="button"
                                                                    className="notification-expand-btn"
                                                                    onClick={() => toggleNotificationExpansion(notification._id)}
                                                                >
                                                                    <i className={`bx ${isExpanded ? 'bx-chevron-up' : 'bx-chevron-down'}`}></i>
                                                                    {isExpanded ? 'Show Less' : 'Show More'}
                                                                </button>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <div className="notification-meta">
                                                <small>
                                                    <i className="bx bx-time"></i>
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </small>
                                                {notification.metadata && (
                                                    <small className="notification-type">
                                                        <i className="bx bx-tag"></i>
                                                        {notification.metadata.type === 'application_status_update' && 'Application Update'}
                                                        {notification.metadata.type === 'interview_scheduled' && 'Interview Scheduled'}
                                                        {notification.metadata.type === 'identity_verification_update' && 'Identity Verification'}
                                                        {!notification.metadata.type && 'System Notification'}
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="notification-actions">
                                        <button
                                            type="button"
                                            className="notification-action-btn"
                                            onClick={() => handleNotificationToggle(notification._id, !notification.read)}
                                            title={notification.read ? 'Mark as unread' : 'Mark as read'}
                                        >
                                            <i className={notification.read ? 'bx bx-envelope' : 'bx bx-envelope-open'}></i>
                                        </button>
                                        <button
                                            type="button"
                                            className="notification-action-btn danger"
                                            onClick={() => handleNotificationDelete(notification._id)}
                                            title="Delete notification"
                                        >
                                            <i className="bx bx-trash"></i>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="panel-description">Admin status updates, interview schedules, and account alerts appear here.</p>
                </section>

                {/* Orders Panel */}
                <section className="panel">
                    <div className="panel-header">
                        <h2>
                            <i className="bx bx-receipt"></i> Your Orders
                        </h2>
                        <div className="panel-header__right">
                            <button
                                type="button"
                                className="header-nav-btn secondary"
                                onClick={fetchMyOrders}
                                disabled={ordersLoading}
                            >
                                <i className="bx bx-refresh"></i>
                                {ordersLoading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                    {ordersLoading ? (
                        <p>Loading your orders...</p>
                    ) : ordersError ? (
                        <p className="form-feedback error">{ordersError}</p>
                    ) : !orders.length ? (
                        <p className="empty-state">You have not placed any orders yet.</p>
                    ) : (
                        <div className="tableWrapper">
                            <table className="orderTable">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o._id || o.OrderID}>
                                            <td>{o.OrderID || o._id}</td>
                                            <td className={`orderStatus ${String(o.status || '').toLowerCase()}`}>{o.status || '-'}</td>
                                            <td>{Number(o.Price ?? o.price ?? 0).toFixed(2)}</td>
                                            <td>{o.CreatedAt || o.createdAt}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <p className="panel-description">Orders placed via the customizer will appear here.</p>
                </section>

                {/* Bookings Panel */}
                <section className="panel">
                    <div className="panel-header">
                        <h2>
                            <i className="bx bx-calendar-check"></i> Your Bookings
                        </h2>
                        <div className="panel-header__right">
                            <button
                                type="button"
                                className="header-nav-btn secondary"
                                onClick={fetchMyBookings}
                                disabled={bookingsLoading}
                            >
                                <i className="bx bx-refresh"></i>
                                {bookingsLoading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>
                    {bookingsLoading ? (
                        <p>Loading your bookings...</p>
                    ) : bookingsError ? (
                        <p className="form-feedback error">{bookingsError}</p>
                    ) : !bookings.length ? (
                        <p className="empty-state">You have no confirmed bookings yet.</p>
                    ) : (
                        <div className="bookings-list">
                            {bookings.map((booking, index) => (
                                <div key={booking._id} className="booking-card">
                                    <div className="booking-image">
                                        <img src={booking.outfit.image} alt={`${booking.outfit.brand} ${booking.outfit.model}`} />
                                    </div>
                                    <div className="booking-details">
                                        <div className="booking-header">
                                            <h4>{booking.outfit.brand} {booking.outfit.model}</h4>
                                            <span className="booking-status confirmed">Confirmed</span>
                                        </div>
                                        <div className="booking-info">
                                            <div className="booking-info-item">
                                                <i className="bx bx-calendar"></i>
                                                <span>{booking.reservationDate.split('T')[0]} to {booking.returnDate.split('T')[0]}</span>
                                            </div>
                                            <div className="booking-info-item">
                                                <i className="bx bx-map"></i>
                                                <span>{booking.outfit.location}</span>
                                            </div>
                                            <div className="booking-info-item">
                                                <i className="bx bx-dollar"></i>
                                                <span>${booking.price}</span>
                                            </div>
                                        </div>
                                        <div className="booking-meta">
                                            <small>
                                                <i className="bx bx-time"></i>
                                                Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="booking-actions">
                                        <button
                                            type="button"
                                            className="header-nav-btn primary"
                                            onClick={() => navigate('/my-bookings')}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="panel-description">Your confirmed rental bookings appear here. Visit My Bookings for full details and payment options.</p>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default UserAccount;
