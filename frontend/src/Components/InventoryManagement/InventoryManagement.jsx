import React, { useState, useEffect } from 'react';
import AdminNav from '../AdminNav/AdminNav';
import Footer from '../Footer/Footer';
import axios from 'axios';
import { useAuth } from '../../AuthGuard/authGuard';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Search, Filter, RefreshCw } from 'lucide-react';
import './InventoryManagement.css';

const InventoryManagement = () => {
    const { isAuthenticated, currentUser } = useAuth();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Form state for add/edit
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        size: [],
        color: [],
        stock: '',
        imageUrl: '',
        brand: '',
        material: '',
        isActive: true
    });

    const categories = ['T-Shirts', 'Hoodies', 'Pants', 'Accessories', 'Shoes', 'Dresses', 'Jackets'];
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];

    useEffect(() => {
        if (!isAuthenticated() || currentUser?.type !== 'Admin') {
            navigate('/unauthorized');
            return;
        }
        fetchItems();
    }, [isAuthenticated, currentUser, navigate]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5001/inventory/admin/all');
            if (response.data.status === 'ok') {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            setError('Failed to fetch items');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/inventory/admin', formData);
            if (response.data.status === 'ok') {
                setShowAddModal(false);
                resetForm();
                fetchItems();
                alert('Item added successfully!');
            }
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditItem = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:5001/inventory/admin/${selectedItem._id}`, formData);
            if (response.data.status === 'ok') {
                setShowEditModal(false);
                resetForm();
                fetchItems();
                alert('Item updated successfully!');
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await axios.delete(`http://localhost:5001/inventory/admin/${itemId}`);
                if (response.data.status === 'ok') {
                    fetchItems();
                    alert('Item deleted successfully!');
                }
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleEditClick = (item) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            category: item.category,
            size: item.size,
            color: item.color,
            stock: item.stock.toString(),
            imageUrl: item.imageUrl,
            brand: item.brand,
            material: item.material || '',
            isActive: item.isActive
        });
        setShowEditModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            size: [],
            color: [],
            stock: '',
            imageUrl: '',
            brand: '',
            material: '',
            isActive: true
        });
        setSelectedItem(null);
    };

    const handleSizeChange = (size) => {
        setFormData(prev => ({
            ...prev,
            size: prev.size.includes(size)
                ? prev.size.filter(s => s !== size)
                : [...prev.size, size]
        }));
    };

    const handleColorChange = (e) => {
        const colors = e.target.value.split(',').map(color => color.trim());
        setFormData(prev => ({ ...prev, color: colors }));
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || item.category === filterCategory;
        const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'active' && item.isActive) ||
                            (filterStatus === 'inactive' && !item.isActive);
        
        return matchesSearch && matchesCategory && matchesStatus;
    });

    if (loading) {
        return (
            <div className="inventory-container">
                <NavBar />
                <div className="loading-container">
                    <RefreshCw className="loading-spinner" />
                    <p>Loading inventory...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="inventory-container">
                <NavBar />
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <button onClick={fetchItems} className="retry-button">Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-container">
            <AdminNav />
            <div className="inventory-content">
                <div className="inventory-header">
                    <h1>Inventory Management</h1>
                    <button 
                        className="add-item-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        <Plus size={20} />
                        Add New Item
                    </button>
                </div>

                <div className="filters-section">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-controls">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="inventory-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item._id} className={!item.isActive ? 'inactive-item' : ''}>
                                    <td>
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.name} 
                                            className="item-thumbnail"
                                        />
                                    </td>
                                    <td>
                                        <div className="item-info">
                                            <strong>{item.name}</strong>
                                            <small>{item.brand}</small>
                                        </div>
                                    </td>
                                    <td>{item.category}</td>
                                    <td>${item.price}</td>
                                    <td>
                                        <span className={`stock-badge ${item.stock > 10 ? 'high' : item.stock > 0 ? 'low' : 'out'}`}>
                                            {item.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                                            {item.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn view"
                                                onClick={() => navigate(`/outlet/${item._id}`)}
                                                title="View Item"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="action-btn edit"
                                                onClick={() => handleEditClick(item)}
                                                title="Edit Item"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDeleteItem(item._id)}
                                                title="Delete Item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredItems.length === 0 && (
                    <div className="empty-state">
                        <p>No items found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Add New Item</h2>
                        <form onSubmit={handleAddItem}>
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock *</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Brand *</label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Image URL *</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Material</label>
                                <input
                                    type="text"
                                    value={formData.material}
                                    onChange={(e) => setFormData({...formData, material: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Sizes *</label>
                                <div className="checkbox-group">
                                    {sizes.map(size => (
                                        <label key={size} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.size.includes(size)}
                                                onChange={() => handleSizeChange(size)}
                                            />
                                            {size}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Colors * (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.color.join(', ')}
                                    onChange={handleColorChange}
                                    placeholder="Red, Blue, Green"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit">Add Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Item Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Edit Item</h2>
                        <form onSubmit={handleEditItem}>
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock *</label>
                                    <input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Brand *</label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Image URL *</label>
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Material</label>
                                <input
                                    type="text"
                                    value={formData.material}
                                    onChange={(e) => setFormData({...formData, material: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Sizes *</label>
                                <div className="checkbox-group">
                                    {sizes.map(size => (
                                        <label key={size} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.size.includes(size)}
                                                onChange={() => handleSizeChange(size)}
                                            />
                                            {size}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Colors * (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.color.join(', ')}
                                    onChange={handleColorChange}
                                    placeholder="Red, Blue, Green"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    />
                                    Active
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit">Update Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default InventoryManagement;
