import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthGuard/AuthGuard';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import './UserAccount.css';

const statusLabels = {
    unverified: 'Not Verified',
    pending: 'Pending Review',
    verified: 'Verified',
    rejected: 'Rejected'
};

const statusStyles = {
    unverified: 'status-tag status-unverified',
    pending: 'status-tag status-pending',
    verified: 'status-tag status-verified',
    rejected: 'status-tag status-rejected'
};

const UserAccount = () => {
    const navigate = useNavigate();
    const { currentUser, logout, updateStoredUser, refreshAuth } = useAuth();

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

    const [identityForm, setIdentityForm] = useState({ evidence: '', notes: '' });
    const [identityError, setIdentityError] = useState('');
    const [identityMessage, setIdentityMessage] = useState('');
    const [identitySaving, setIdentitySaving] = useState(false);
    const [expandedNotifications, setExpandedNotifications] = useState(new Set());

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
        setIdentityForm({
            evidence: userData.identityEvidence || '',
            notes: userData.identityNotes || ''
        });
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

    useEffect(() => {
        if (!identityMessage && !identityError) {
            return;
        }
        const timer = setTimeout(() => {
            setIdentityMessage('');
            setIdentityError('');
        }, 4000);
        return () => clearTimeout(timer);
    }, [identityMessage, identityError]);

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

    const handleIdentitySubmit = async (event) => {
        event.preventDefault();
        setIdentityError('');
        setIdentityMessage('');

        if (!identityForm.evidence || !identityForm.evidence.trim()) {
            setIdentityError('Please provide details about your identity evidence.');
            return;
        }

        if (!userId) {
            return;
        }

        setIdentitySaving(true);
        try {
            const response = await axios.post(`http://localhost:5001/users/${userId}/identity/submit`, {
                identityEvidence: identityForm.evidence,
                identityNotes: identityForm.notes
            });

            if (response.data?.status === 'ok') {
                applyProfile(response.data.user);
                updateStoredUser(response.data.user);
                setIdentityMessage('Identity verification submitted successfully.');
            } else {
                setIdentityError(response.data?.message || 'Unable to submit identity verification.');
            }
        } catch (error) {
            console.error('Failed to submit identity verification:', error);
            if (error.response?.data?.message) {
                setIdentityError(error.response.data.message);
            } else {
                setIdentityError('Something went wrong while submitting your identity verification.');
            }
        } finally {
            setIdentitySaving(false);
        }
    };

    const handleIdentityChange = (event) => {
        const { name, value } = event.target;
        setIdentityForm((prev) => ({ ...prev, [name]: value }));
    };

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
                    <div className={statusStyles[profile?.identityStatus || 'unverified']}>
                        {statusLabels[profile?.identityStatus || 'unverified']}
                    </div>
                </header>
                <p className="account-subtitle">Manage your profile, notifications, and identity verification.</p>

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
                            {profile?.identitySubmittedAt && (
                                <label>
                                    <span>Identity Submitted</span>
                                    <input
                                        type="text"
                                        value={new Date(profile.identitySubmittedAt).toLocaleString()}
                                        disabled
                                    />
                                </label>
                            )}
                            {profileMessage && <p className="form-feedback success">{profileMessage}</p>}
                            {profileError && <p className="form-feedback error">{profileError}</p>}
                        </form>
                    </section>
                )}

                <section className="panel">
                    <h2>Identity Verification</h2>
                    <p className="panel-description">
                        Provide details that help us verify your identity. An administrator will review your submission.
                    </p>
                    <form className="form-vertical" onSubmit={handleIdentitySubmit}>
                        <label>
                            <span>Identity Evidence</span>
                            <textarea
                                name="evidence"
                                value={identityForm.evidence}
                                onChange={handleIdentityChange}
                                placeholder="Describe the documents or information you can provide for identity verification."
                                rows={4}
                                required
                            />
                        </label>
                        <label>
                            <span>Additional Notes (optional)</span>
                            <textarea
                                name="notes"
                                value={identityForm.notes}
                                onChange={handleIdentityChange}
                                placeholder="Add any notes that will assist the reviewer."
                                rows={3}
                            />
                        </label>
                        <div className="form-actions">
                            <button type="submit" className="primary-btn" disabled={identitySaving}>
                                {identitySaving ? 'Submitting...' : 'Submit for Verification'}
                            </button>
                        </div>
                        {identityMessage && <p className="form-feedback success">{identityMessage}</p>}
                        {identityError && <p className="form-feedback error">{identityError}</p>}
                    </form>
                </section>

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
            </main>
            <Footer />
        </div>
    );
};

export default UserAccount;

