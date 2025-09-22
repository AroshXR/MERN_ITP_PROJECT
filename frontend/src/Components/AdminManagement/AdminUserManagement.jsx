import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import { useAuth } from '../../AuthGuard/AuthGuard';
import './AdminUserManagement.css';

const statusLabels = {
    unverified: 'Not Verified',
    pending: 'Pending',
    verified: 'Verified',
    rejected: 'Rejected'
};

const notificationLevels = [
    { value: 'info', label: 'Info' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Alert' }
];

const AdminUserManagement = () => {
    const { currentUser } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [createForm, setCreateForm] = useState({
        username: '',
        email: '',
        address: '',
        password: '',
        type: 'Customer',
        phoneNumber: ''
    });
    const [createLoading, setCreateLoading] = useState(false);

    const [selectedUserId, setSelectedUserId] = useState('');
    const selectedUser = useMemo(() => users.find((user) => user._id === selectedUserId), [users, selectedUserId]);

    const [identityForm, setIdentityForm] = useState({ status: 'pending', notes: '', reviewer: '' });
    const [notificationForm, setNotificationForm] = useState({ message: '', level: 'info' });

    const [managementMessage, setManagementMessage] = useState('');
    const [managementError, setManagementError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get('http://localhost:5001/users');
            if (response.data?.status === 'ok') {
                setUsers(response.data.users || []);
            } else {
                setError(response.data?.message || 'Unable to load users.');
            }
        } catch (fetchError) {
            console.error('Failed to load users:', fetchError);
            setError('Unable to load users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!selectedUser) {
            return;
        }
        setIdentityForm({
            status: selectedUser.identityStatus || 'unverified',
            notes: selectedUser.identityNotes || '',
            reviewer: currentUser?.username || 'Admin'
        });
    }, [selectedUser, currentUser]);

    useEffect(() => {
        if (!managementMessage && !managementError) {
            return;
        }
        const timer = setTimeout(() => {
            setManagementMessage('');
            setManagementError('');
        }, 4000);
        return () => clearTimeout(timer);
    }, [managementMessage, managementError]);

    const handleCreateChange = (event) => {
        const { name, value } = event.target;
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (event) => {
        event.preventDefault();
        setCreateLoading(true);
        setManagementMessage('');
        setManagementError('');

        try {
            const response = await axios.post('http://localhost:5001/users', createForm);
            if (response.data?.status === 'ok') {
                setCreateForm({ username: '', email: '', address: '', password: '', type: 'Customer', phoneNumber: '' });
                setManagementMessage('User created successfully.');
                fetchUsers();
            } else {
                setManagementError(response.data?.message || 'Unable to create user.');
            }
        } catch (createError) {
            console.error('Failed to create user:', createError);
            if (createError.response?.data?.message) {
                setManagementError(createError.response.data.message);
            } else {
                setManagementError('Unable to create user. Please try again.');
            }
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        const confirmed = window.confirm('Delete this account? This cannot be undone.');
        if (!confirmed) {
            return;
        }

        setActionLoading(true);
        try {
            const response = await axios.delete(`http://localhost:5001/users/${userId}`);
            if (response.data?.status === 'ok') {
                setManagementMessage('User deleted successfully.');
                setSelectedUserId((prev) => (prev === userId ? '' : prev));
                fetchUsers();
            } else {
                setManagementError(response.data?.message || 'Unable to delete user.');
            }
        } catch (deleteError) {
            console.error('Failed to delete user:', deleteError);
            setManagementError('Unable to delete user.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleIdentityChange = (event) => {
        const { name, value } = event.target;
        setIdentityForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleIdentityUpdate = async (event) => {
        event.preventDefault();
        if (!selectedUser?._id) {
            return;
        }

        setActionLoading(true);
        setManagementMessage('');
        setManagementError('');

        try {
            const response = await axios.patch(`http://localhost:5001/users/${selectedUser._id}/identity-status`, {
                status: identityForm.status,
                notes: identityForm.notes,
                reviewer: identityForm.reviewer || currentUser?.username
            });

            if (response.data?.status === 'ok') {
                setManagementMessage('Identity status updated.');
                fetchUsers();
            } else {
                setManagementError(response.data?.message || 'Unable to update identity status.');
            }
        } catch (updateError) {
            console.error('Failed to update identity status:', updateError);
            if (updateError.response?.data?.message) {
                setManagementError(updateError.response.data.message);
            } else {
                setManagementError('Unable to update identity status.');
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleNotificationChange = (event) => {
        const { name, value } = event.target;
        setNotificationForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSendNotification = async (event) => {
        event.preventDefault();
        if (!selectedUser?._id || !notificationForm.message.trim()) {
            return;
        }

        setActionLoading(true);
        setManagementMessage('');
        setManagementError('');

        try {
            const response = await axios.post(`http://localhost:5001/users/${selectedUser._id}/notifications`, {
                message: notificationForm.message,
                level: notificationForm.level
            });

            if (response.data?.status === 'ok') {
                setManagementMessage('Notification sent.');
                setNotificationForm({ message: '', level: notificationForm.level });
            } else {
                setManagementError(response.data?.message || 'Unable to send notification.');
            }
        } catch (notifyError) {
            console.error('Failed to send notification:', notifyError);
            if (notifyError.response?.data?.message) {
                setManagementError(notifyError.response.data.message);
            } else {
                setManagementError('Unable to send notification.');
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateUserType = async (userId, nextType) => {
        setActionLoading(true);
        setManagementMessage('');
        setManagementError('');

        try {
            const response = await axios.put(`http://localhost:5001/users/${userId}`, { type: nextType });
            if (response.data?.status === 'ok') {
                setManagementMessage('User role updated.');
                fetchUsers();
            } else {
                setManagementError(response.data?.message || 'Unable to update user role.');
            }
        } catch (roleError) {
            console.error('Failed to update user role:', roleError);
            setManagementError('Unable to update user role.');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="admin-management-page">
            <NavBar />
            <main className="admin-management-content">
                <header className="admin-header">
                    <div>
                        <h1>User & Identity Management</h1>
                        <p>Create and manage user accounts, notifications, and identity verification requests.</p>
                    </div>
                    {currentUser && (
                        <span className="admin-badge">Admin: {currentUser.username}</span>
                    )}
                </header>

                <section className="admin-panel">
                    <h2>Create User or Admin Account</h2>
                    <form className="grid-form" onSubmit={handleCreateUser}>
                        <label>
                            <span>Username</span>
                            <input name="username" value={createForm.username} onChange={handleCreateChange} required />
                        </label>
                        <label>
                            <span>Email</span>
                            <input type="email" name="email" value={createForm.email} onChange={handleCreateChange} required />
                        </label>
                        <label>
                            <span>Address</span>
                            <input name="address" value={createForm.address} onChange={handleCreateChange} required />
                        </label>
                        <label>
                            <span>Phone Number</span>
                            <input name="phoneNumber" value={createForm.phoneNumber} onChange={handleCreateChange} placeholder="Optional" />
                        </label>
                        <label>
                            <span>Password</span>
                            <input type="password" name="password" value={createForm.password} onChange={handleCreateChange} required />
                        </label>
                        <label>
                            <span>Role</span>
                            <select name="type" value={createForm.type} onChange={handleCreateChange}>
                                <option value="Customer">Customer</option>
                                <option value="Applicant">Applicant</option>
                                <option value="Tailor">Tailor</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </label>
                        <div className="form-actions">
                            <button type="submit" disabled={createLoading}>
                                {createLoading ? 'Creating...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="admin-panel">
                    <div className="panel-heading">
                        <h2>Registered Users</h2>
                        <button type="button" onClick={fetchUsers} disabled={loading}>
                            Refresh
                        </button>
                    </div>
                    {loading ? (
                        <p>Loading users...</p>
                    ) : error ? (
                        <p className="error-text">{error}</p>
                    ) : (
                        <div className="user-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Identity Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className={selectedUserId === user._id ? 'selected' : ''}>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <select
                                                    value={user.type}
                                                    onChange={(event) => handleUpdateUserType(user._id, event.target.value)}
                                                >
                                                    <option value="Customer">Customer</option>
                                                    <option value="Applicant">Applicant</option>
                                                    <option value="Tailor">Tailor</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                            </td>
                                            <td>
                                                <span className={`status-pill status-${user.identityStatus || 'unverified'}`}>
                                                    {statusLabels[user.identityStatus || 'unverified']}
                                                </span>
                                            </td>
                                            <td className="row-actions">
                                                <button type="button" onClick={() => setSelectedUserId(user._id)}>
                                                    Manage
                                                </button>
                                                <button type="button" className="danger" onClick={() => handleDeleteUser(user._id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {selectedUser && (
                    <section className="admin-panel">
                        <h2>Manage {selectedUser.username}</h2>
                        <div className="management-grid">
                            <div className="management-card">
                                <h3>Identity Verification</h3>
                                <form className="vertical-form" onSubmit={handleIdentityUpdate}>
                                    <label>
                                        <span>Status</span>
                                        <select name="status" value={identityForm.status} onChange={handleIdentityChange}>
                                            <option value="unverified">Unverified</option>
                                            <option value="pending">Pending</option>
                                            <option value="verified">Verified</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </label>
                                    <label>
                                        <span>Reviewer</span>
                                        <input name="reviewer" value={identityForm.reviewer} onChange={handleIdentityChange} placeholder="Reviewer name" />
                                    </label>
                                    <label>
                                        <span>Notes</span>
                                        <textarea
                                            name="notes"
                                            rows={4}
                                            value={identityForm.notes}
                                            onChange={handleIdentityChange}
                                            placeholder="Add details about the identity review."
                                        />
                                    </label>
                                    {selectedUser.identityEvidence && (
                                        <div className="identity-evidence">
                                            <strong>User Evidence:</strong>
                                            <p>{selectedUser.identityEvidence}</p>
                                        </div>
                                    )}
                                    <button type="submit" disabled={actionLoading}>
                                        {actionLoading ? 'Saving...' : 'Update Identity Status'}
                                    </button>
                                </form>
                            </div>

                            <div className="management-card">
                                <h3>Send Notification</h3>
                                <form className="vertical-form" onSubmit={handleSendNotification}>
                                    <label>
                                        <span>Message</span>
                                        <textarea
                                            name="message"
                                            rows={4}
                                            value={notificationForm.message}
                                            onChange={handleNotificationChange}
                                            placeholder="Enter the notification text."
                                            required
                                        />
                                    </label>
                                    <label>
                                        <span>Level</span>
                                        <select name="level" value={notificationForm.level} onChange={handleNotificationChange}>
                                            {notificationLevels.map((level) => (
                                                <option key={level.value} value={level.value}>
                                                    {level.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <button type="submit" disabled={actionLoading}>
                                        {actionLoading ? 'Sending...' : 'Send Notification'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>
                )}

                {managementMessage && <p className="feedback success">{managementMessage}</p>}
                {managementError && <p className="feedback error">{managementError}</p>}
            </main>
            <Footer />
        </div>
    );
};

export default AdminUserManagement;
