import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import './ClothingInventoryManagement.css';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

// Predefined options
const CATEGORY_OPTIONS = [
  'T-Shirts','Shirts','Pants','Jeans','Shorts','Dresses','Skirts','Jackets','Coats','Sweaters','Hoodies','Suits','Accessories'
];
const MATERIAL_OPTIONS = [
  'Cotton','Linen','Silk','Wool','Polyester','Denim','Leather','Rayon','Nylon','Viscose'
];
const COLOR_OPTIONS = [
  'Black','White','Grey','Blue','Navy','Red','Green','Yellow','Pink','Purple','Brown','Beige','Maroon','Orange'
];
const SIZE_OPTIONS = ['S','M','L','XL','XXL'];

const ClothingInventoryManagement = () => {
  const [clothingItems, setClothingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    material: '',
    colors: '',
    sizes: '',
    stock: '',
    imageUrl: '',
    tags: '',
    status: 'active'
  });

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllInView = () => {
    const ids = filteredItems.map(i => i._id);
    const allSelected = ids.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  const generateReport = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one item to generate a report');
      return;
    }
    try {
      setReportLoading(true);
      setReportError('');
      setReportData(null);
      const { data } = await axios.post(`${API_BASE_URL}/clothing/report`, { ids: selectedIds });
      setReportData(data);
    } catch (err) {
      console.error('Report generation failed', err);
      const serverMsg = err?.response?.data?.message || err?.message || 'Failed to generate report';
      setReportError(serverMsg);
    } finally {
      setReportLoading(false);
    }
  };
  const [errors, setErrors] = useState({});
  const [reportMode, setReportMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchClothingItems();
  }, []);

  const fetchClothingItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/clothing`);
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

  const isValidUrl = (str) => {
    try {
      const u = new URL(str);
      return !!u.protocol && (u.protocol === 'http:' || u.protocol === 'https:');
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const name = formData.name?.trim();
    const description = formData.description?.trim();
    const priceNum = Number(formData.price);
    const category = formData.category?.trim();
    const brand = formData.brand?.trim();
    const material = formData.material?.trim();
    const colors = formData.colors?.trim();
    const sizes = formData.sizes?.trim();
    const stockNum = Number.isInteger(Number(formData.stock)) ? Number(formData.stock) : NaN;
    const imageUrl = formData.imageUrl?.trim();
    const status = formData.status;

    if (!name) newErrors.name = 'Name is required';
    else if (name.length < 2) newErrors.name = 'Name must be at least 2 characters';

    if (!Number.isFinite(priceNum)) newErrors.price = 'Price is required';
    else if (isNaN(priceNum) || priceNum < 0) newErrors.price = 'Price cannot be negative';

    if (!category) newErrors.category = 'Category is required';
    if (!brand) newErrors.brand = 'Brand is required';
    if (!material) newErrors.material = 'Material is required';
    if (!colors) newErrors.colors = 'At least one color is required';
    if (!sizes) newErrors.sizes = 'At least one size is required';

    if (formData.stock === '') newErrors.stock = 'Stock is required';
    else if (isNaN(stockNum) || stockNum < 0) newErrors.stock = 'Stock must be an integer 0 or greater';

    if (!description) newErrors.description = 'Description is required';
    else if (description.length < 10) newErrors.description = 'Description must be at least 10 characters';

    if (!imageUrl) newErrors.imageUrl = 'Image URL is required';
    else if (!isValidUrl(imageUrl)) newErrors.imageUrl = 'Image URL must be a valid http(s) URL';

    if (status && !['active', 'archived', 'draft'].includes(status)) {
      newErrors.status = 'Invalid status value';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        sizes: formData.sizes.split(',').map(v => v.trim()).filter(Boolean),
        colors: formData.colors.split(',').map(v => v.trim()).filter(Boolean)
      };

      if (editingItem) {
        await axios.put(`${API_BASE_URL}/clothing/${editingItem._id}`, itemData);
      } else {
        await axios.post(`${API_BASE_URL}/clothing`, itemData);
      }

      setShowAddForm(false);
      setEditingItem(null);
      resetForm();
      setErrors({});
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
      colors: item.colors?.join(', ') || '',
      sizes: item.sizes?.join(', ') || '',
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
        await axios.delete(`${API_BASE_URL}/clothing/${itemId}`);
        fetchClothingItems();
      } catch (error) {
        console.error('Error deleting clothing item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      material: '',
      colors: '',
      sizes: '',
      stock: '',
      imageUrl: '',
      tags: '',
      status: 'active'
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingItem(null);
    resetForm();
  };

  const toggleTokenInCSV = (csv, token) => {
    const arr = csv ? csv.split(',').map(v => v.trim()).filter(Boolean) : [];
    const idx = arr.indexOf(token);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(token);
    return arr.join(', ');
  };

  // Filter items based on search and filters
  const filteredItems = clothingItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter
  const categories = [...new Set(clothingItems.map(item => item.category))];

  if (loading) {
    return (
      <div className="clothing-inventory-loading">
        <NavBar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading inventory...</p>
        </div>

        {/* Report Toolbar */}
        <div className="report-toolbar" style={{ position: 'sticky', top: 64, zIndex: 5, background: '#fff', padding: '8px 0', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" className={`btn ${reportMode ? 'btn-secondary' : 'btn-primary'}`} onClick={() => { setReportMode(v => !v); setSelectedIds([]); setReportData(null); setReportError(''); }}>
            {reportMode ? 'Exit Report Mode' : 'Report Mode'}
          </button>
          {reportMode && (
            <>
              <button type="button" className="btn btn-secondary" onClick={selectAllInView}>Select All (visible)</button>
              <button type="button" className="btn btn-primary" onClick={generateReport} disabled={reportLoading}>
                {reportLoading ? 'Generating...' : `Generate Report (${selectedIds.length} selected)`}
              </button>
              {reportError && <span style={{ color: '#b91c1c' }}>{reportError}</span>}
            </>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="clothing-inventory-page">
      <NavBar />
      <main className="clothing-inventory">
        <header className="inventory-header">
          <div className="header-content">
            <h1>Clothing Inventory Management</h1>
            <p>Manage your clothing items, stock levels, and inventory</p>
          </div>
          <button 
            className="btn btn-primary add-item-btn"
            onClick={() => setShowAddForm(true)}
          >
            <i className='bx bx-plus'></i>
            Add New Item
          </button>
          
        </header>

        {/* Filters and Search */}
        <div className="inventory-filters">
          <div className="search-box">
            <i className='bx bx-search'></i>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="inventory-form-overlay">
            <div className="inventory-form">
              <div className="form-header">
                <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                <button className="close-btn" onClick={handleCancel}>
                  <i className='bx bx-x'></i>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={errors.name ? { borderColor: '#ef4444' } : undefined}
                    />
                    {errors.name && <small className="error-text">{errors.name}</small>}
                  </div>
                  
                  <div className="form-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      style={errors.price ? { borderColor: '#ef4444' } : undefined}
                    />
                    {errors.price && <small className="error-text">{errors.price}</small>}
                  </div>

                  <h3 className="section-title" style={{ gridColumn: '1 / -1', marginTop: 8 }}>Selections</h3>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      style={errors.category ? { borderColor: '#ef4444' } : undefined}
                    >
                      <option value="">Select category</option>
                      {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {errors.category && <small className="error-text">{errors.category}</small>}
                  </div>
                  
                  <div className="form-group">
                    <label>Brand *</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                      style={errors.brand ? { borderColor: '#ef4444' } : undefined}
                    />
                    {errors.brand && <small className="error-text">{errors.brand}</small>}
                  </div>

                  <div className="form-group">
                    <label>Material *</label>
                    <select
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      required
                      style={errors.material ? { borderColor: '#ef4444' } : undefined}
                    >
                      <option value="">Select material</option>
                      {MATERIAL_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {errors.material && <small className="error-text">{errors.material}</small>}
                  </div>
                  
                  <h3 className="section-title" style={{ gridColumn: '1 / -1', marginTop: 8 }}>Options</h3>
                  <div className="form-group">
                    <label>Colors *</label>
                    <div className="checkbox-grid">
                      {COLOR_OPTIONS.map(opt => {
                        const selected = (formData.colors || '').split(',').map(v => v.trim()).filter(Boolean).includes(opt);
                        return (
                          <label key={opt} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => setFormData(prev => ({ ...prev, colors: toggleTokenInCSV(prev.colors, opt) }))}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.colors && <small className="error-text">{errors.colors}</small>}
                  </div>

                  <div className="form-group">
                    <label>Sizes *</label>
                    <div className="checkbox-grid">
                      {SIZE_OPTIONS.map(opt => {
                        const selected = (formData.sizes || '').split(',').map(v => v.trim()).filter(Boolean).includes(opt);
                        return (
                          <label key={opt} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => setFormData(prev => ({ ...prev, sizes: toggleTokenInCSV(prev.sizes, opt) }))}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                    {errors.sizes && <small className="error-text">{errors.sizes}</small>}
                  </div>
                  
                  <div className="form-group">
                    <label>Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="1"
                      style={errors.stock ? { borderColor: '#ef4444' } : undefined}
                    />
                    {errors.stock && <small className="error-text">{errors.stock}</small>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    style={errors.description ? { borderColor: '#ef4444' } : undefined}
                  />
                  {errors.description && <small className="error-text">{errors.description}</small>}
                </div>

                <div className="form-group">
                  <label>Image URL *</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    required
                    style={errors.imageUrl ? { borderColor: '#ef4444' } : undefined}
                  />
                  {errors.imageUrl && <small className="error-text">{errors.imageUrl}</small>}
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
                    <option value="archived">Archived</option>
                    <option value="draft">Draft</option>
                  </select>
                  {errors.status && <small className="error-text">{errors.status}</small>}
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
          </div>
        )}

        {/* Inventory Grid */}
        <div className="inventory-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item._id} className="inventory-item">
                {reportMode && (
                  <div className="select-checkbox" style={{ position: 'absolute', zIndex: 2, padding: 6 }}>
                    <input type="checkbox" checked={selectedIds.includes(item._id)} onChange={() => toggleSelect(item._id)} />
                  </div>
                )}
                <div className="item-image">
                  <img src={item.imageUrl} alt={item.name} />
                  <div className={`stock-badge ${item.stock === 0 ? 'out-of-stock' : item.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                    {item.stock === 0 ? 'Out of Stock' : item.stock < 10 ? 'Low Stock' : 'In Stock'}
                  </div>
                </div>
                
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price}</p>
                  <div className="item-meta">
                    <span className="meta-item">
                      <i className='bx bx-category'></i>
                      {item.category}
                    </span>
                    <span className="meta-item">
                      <i className='bx bx-purchase-tag'></i>
                      {item.brand}
                    </span>
                    <span className="meta-item">
                      <i className='bx bx-package'></i>
                      Stock: {item.stock}
                    </span>
                  </div>
                  <p className="item-description">{item.description}</p>
                </div>
                
                <div className="item-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleEdit(item)}
                  >
                    <i className='bx bx-edit'></i>
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(item._id)}
                  >
                    <i className='bx bx-trash'></i>
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-items">
              <i className='bx bx-package'></i>
              <h3>No items found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {reportMode && (
          <div className="report-results" style={{ marginTop: 24 }}>
            <h2>Report</h2>
            {reportError && <div style={{ color: '#b91c1c' }}>{reportError}</div>}
            {reportLoading && <div>Generating report...</div>}
            {reportData && Array.isArray(reportData.data) && reportData.data.length > 0 && (
              <div style={{ display: 'grid', gap: 16 }}>
                {reportData.data.map((it) => (
                  <div key={it._id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0 }}>{it.name} <span style={{ color: '#6b7280', fontWeight: 400 }}>({it.brand} {it.category})</span></h3>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Price: ${it.price} • Stock: {it.stock} • Rating: {Number(it.rating).toFixed(1)} ({it.numReviews})</div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <strong>Timeline:</strong>
                      {(!it.timeline || it.timeline.length === 0) && <div style={{ color: '#6b7280' }}>No timeline data (no reviews)</div>}
                      {it.timeline && it.timeline.length > 0 && (
                        <ul style={{ margin: '8px 0 0 16px' }}>
                          {it.timeline.map((t, idx) => (
                            <li key={idx}>
                              {new Date(t.date).toLocaleString()} — Rating {t.rating}/5 — {t.username}{t.comment ? `: ${t.comment}` : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inventory Summary */}
        <div className="inventory-summary">
          <div className="summary-card">
            <h4>Total Items</h4>
            <span className="summary-number">{clothingItems.length}</span>
          </div>
          <div className="summary-card">
            <h4>In Stock</h4>
            <span className="summary-number">{clothingItems.filter(item => item.stock > 0).length}</span>
          </div>
          <div className="summary-card">
            <h4>Low Stock</h4>
            <span className="summary-number warning">{clothingItems.filter(item => item.stock < 10 && item.stock > 0).length}</span>
          </div>
          <div className="summary-card">
            <h4>Out of Stock</h4>
            <span className="summary-number danger">{clothingItems.filter(item => item.stock === 0).length}</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClothingInventoryManagement;
