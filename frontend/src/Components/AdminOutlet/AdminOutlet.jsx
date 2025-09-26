import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../AuthGuard/AuthGuard';
import './AdminOutlet.css';

const AdminOutlet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    material: '',
    color: '',
    size: '',
    stock: '',
    imageUrl: '',
    tags: '',
    status: 'active'
  });

  useEffect(() => {
    if (user?.type?.toLowerCase() !== 'admin') {
      navigate('/unauthorized');
      return;
    }
    fetchClothingItems();
  }, [user, navigate]);

  const fetchClothingItems = async () => {
    try {
      const response = await axios.get('http://localhost:5001/clothing');
      setClothingItems(response.data);
    } catch (error) {
      console.error('Error fetching clothing items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingItem) {
        await axios.put(`http://localhost:5001/clothing/${editingItem._id}`, itemData);
      } else {
        await axios.post('http://localhost:5001/clothing', itemData);
      }

      setShowAddForm(false);
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        material: '',
        color: '',
        size: '',
        stock: '',
        imageUrl: '',
        tags: '',
        status: 'active'
      });
      fetchClothingItems();
    } catch (error) {
      console.error('Error saving clothing item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      brand: item.brand,
      material: item.material,
      color: item.color,
      size: item.size,
      stock: item.stock.toString(),
      imageUrl: item.imageUrl,
      tags: item.tags?.join(', ') || '',
      status: item.status
    });
    setShowAddForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5001/clothing/${itemId}`);
        fetchClothingItems();
      } catch (error) {
        console.error('Error deleting clothing item:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      material: '',
      color: '',
      size: '',
      stock: '',
      imageUrl: '',
      tags: '',
      status: 'active'
    });
  };

  if (loading) {
    return <div className="admin-outlet-loading">Loading...</div>;
  }

  return (
    <div className="admin-outlet">
      <div className="admin-outlet-header">
        <h1>Admin Outlet Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          Add New Item
        </button>
      </div>

      {showAddForm && (
        <div className="admin-outlet-form">
          <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Material</label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Size</label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="casual, summer, cotton"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-outlet-grid">
        {clothingItems.map((item) => (
          <div key={item._id} className="admin-outlet-item">
            <div className="item-image">
              <img src={item.imageUrl} alt={item.name} />
            </div>
            <div className="item-details">
              <h3>{item.name}</h3>
              <p className="item-price">${item.price}</p>
              <p className="item-category">{item.category}</p>
              <p className="item-brand">{item.brand}</p>
              <p className="item-stock">Stock: {item.stock}</p>
              <p className="item-status">Status: {item.status}</p>
            </div>
            <div className="item-actions">
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => handleEdit(item)}
              >
                Edit
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOutlet;