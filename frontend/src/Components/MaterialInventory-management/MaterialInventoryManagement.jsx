"use client"
import Footer from "../Footer/Footer"
import NavBar from "../NavBar/navBar"
import "./MaterialInventoryManagement.css"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function MaterialInventoryManagement() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [inventoryItems, setInventoryItems] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("")
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [stats, setStats] = useState({})
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [sortBy, setSortBy] = useState("itemName")
  const [sortOrder, setSortOrder] = useState("asc")
  const [viewMode, setViewMode] = useState("table") // table or grid

  // API base URLs
  const INVENTORY_API_URL = "http://localhost:5001/inventory"
  const SUPPLIER_API_URL = "http://localhost:5001/supplier"

  // API functions
  const fetchInventoryItems = async () => {
    try {
      const response = await fetch(`${INVENTORY_API_URL}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch inventory items')
      }
      const data = await response.json()
      console.log('Fetched inventory items:', data)
      setInventoryItems(data)
    } catch (error) {
      console.error('Error fetching inventory items:', error)
      setError('Failed to load inventory items')
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${SUPPLIER_API_URL}/suppliers`)
      if (!response.ok) throw new Error('Failed to fetch suppliers')
      const data = await response.json()
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setError('Failed to load suppliers')
    }
  }

  const fetchInventoryStats = async () => {
    try {
      const response = await fetch(`${INVENTORY_API_URL}/stats`)
      if (!response.ok) throw new Error('Failed to fetch inventory stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching inventory stats:', error)
    }
  }

  const createInventoryItem = async (itemData) => {
    try {
      const response = await fetch(`${INVENTORY_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create inventory item')
      }
      const data = await response.json()
      setInventoryItems([...inventoryItems, data])
      return data
    } catch (error) {
      console.error('Error creating inventory item:', error)
      throw error
    }
  }

  const updateInventoryItem = async (id, itemData) => {
    try {
      const response = await fetch(`${INVENTORY_API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      })
      if (!response.ok) throw new Error('Failed to update inventory item')
      const data = await response.json()
      setInventoryItems(inventoryItems.map(item => item._id === id ? data : item))
      return data
    } catch (error) {
      console.error('Error updating inventory item:', error)
      throw error
    }
  }

  const updateItemQuantity = async (id, quantity, reason) => {
    try {
      const response = await fetch(`${INVENTORY_API_URL}/${id}/quantity`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, reason }),
      })
      if (!response.ok) throw new Error('Failed to update quantity')
      const data = await response.json()
      setInventoryItems(inventoryItems.map(item => item._id === id ? data.item : item))
      return data
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    }
  }

  const consumeItem = async (id, quantityUsed, reason, usedBy) => {
    try {
      const response = await fetch(`${INVENTORY_API_URL}/${id}/use`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantityUsed, reason, usedBy }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to use item')
      }
      const data = await response.json()
      setInventoryItems(inventoryItems.map(item => item._id === id ? data.item : item))
      return data
    } catch (error) {
      console.error('Error using item:', error)
      throw error
    }
  }


  const deleteInventoryItem = async (id) => {
    try {
      const response = await fetch(`${INVENTORY_API_URL}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete inventory item')
      setInventoryItems(inventoryItems.filter(item => item._id !== id))
    } catch (error) {
      console.error('Error deleting inventory item:', error)
      throw error
    }
  }

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Test backend connection first
        const testResponse = await fetch('http://localhost:5001/test')
        if (!testResponse.ok) {
          throw new Error('Backend server is not responding')
        }
        console.log('Backend connection test successful')

        await Promise.all([
          fetchInventoryItems(),
          fetchSuppliers(),
          fetchInventoryStats()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load data: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter and sort inventory items
  const filteredItems = inventoryItems
    .filter(item => {
      const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === "all" || item.status === filterStatus
      const matchesCategory = filterCategory === "all" || item.category === filterCategory
      
      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'totalValue' || sortBy === 'unitPrice' || sortBy === 'quantity') {
        aValue = parseFloat(aValue) || 0
        bValue = parseFloat(bValue) || 0
      } else {
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Get unique categories for filter
  const categories = [...new Set(inventoryItems.map(item => item.category))]

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)
    setError(null)
    setSuccessMessage("")
    
    if (type === "quantity" && item) {
      setFormData({
        quantity: item.quantity,
        reason: ""
      })
    } else if (type === "use" && item) {
      setFormData({
        quantityUsed: 1,
        reason: "Production use",
        usedBy: "",
        availableStock: item.quantity,
        unit: item.unit
      })
    } else if (item) {
      setFormData(item)
    } else {
      setFormData({
        itemName: "",
        description: "",
        quantity: 0,
        unit: "pieces",
        unitPrice: 0,
        supplierId: "",
        supplierName: "",
        category: "Materials",
        location: "Main Warehouse",
        minimumStock: 10
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType("")
    setEditingItem(null)
    setFormData({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (modalType === "quantity") {
        await updateItemQuantity(editingItem._id, parseInt(formData.quantity), formData.reason)
        setSuccessMessage("Quantity updated successfully!")
      } else if (modalType === "use") {
        const result = await consumeItem(editingItem._id, parseInt(formData.quantityUsed), formData.reason, formData.usedBy)
        setSuccessMessage(`Used ${formData.quantityUsed} ${formData.unit}. Remaining: ${result.remainingStock} ${formData.unit}`)
        if (result.alertSent) {
          setSuccessMessage(prev => prev + " | Low stock alert sent!")
        }
      } else if (modalType === "item") {
        if (editingItem) {
          await updateInventoryItem(editingItem._id, formData)
          setSuccessMessage("Item updated successfully!")
        } else {
          // Find supplier name if supplierId is provided
          if (formData.supplierId) {
            const supplier = suppliers.find(s => s._id === formData.supplierId)
            formData.supplierName = supplier ? supplier.name : ""
          }
          await createInventoryItem(formData)
          setSuccessMessage("Item created successfully!")
        }
      }

      closeModal()
      setTimeout(() => setSuccessMessage(""), 3000)
      
      // Refresh data
      await Promise.all([fetchInventoryItems(), fetchInventoryStats()])
    } catch (error) {
      console.error('Error submitting form:', error)
      setError('Error saving data. Please try again.')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteInventoryItem(id)
        setSuccessMessage("Item deleted successfully!")
        setTimeout(() => setSuccessMessage(""), 3000)
      } catch (error) {
        setError(error.message)
        setTimeout(() => setError(null), 5000)
      }
    }
  }


  if (loading) {
    return (
      <div className="inventory-container">
        <div className="dashboard-header">
          <h1>Material Inventory Management</h1>
          <h3>Loading...</h3>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="inventory-container">
        <div className="dashboard-header">
          <h1>Material Inventory Management</h1>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="main">
      <NavBar />
      <div className="dashboard-header">
        <h1>Material Inventory Management</h1>
        
        {/* Back Button */}
        <div className="back-button-container" style={{ 
          marginTop: '20px', 
          marginBottom: '20px',
          position: 'relative',
          zIndex: 1000,
          display: 'block',
          width: 'fit-content'
        }}>
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#ffffff',
              border: '2px solid #333',
              borderRadius: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              position: 'relative',
              zIndex: 1001
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#333';
              e.target.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#ffffff';
              e.target.style.color = '#333';
            }}
          >
            <span>←</span>
            <span>Back</span>
          </button>
        </div>
 
        {successMessage && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            padding: '10px',
            borderRadius: '5px',
            marginTop: '10px',
            border: '1px solid #bbf7d0'
          }}>
            {successMessage}
          </div>
        )}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            padding: '10px',
            borderRadius: '5px',
            marginTop: '10px',
            border: '1px solid #fecaca'
          }}>
            Error: {error}
            <button
              onClick={() => {
                setError(null)
                window.location.reload()
              }}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <div className="inventory-container">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            Inventory Items
          </button>
          <button
            className={`nav-tab ${activeTab === "alerts" ? "active" : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            Stock Alerts
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div>
            <div className="dashboard-grid">
              <div className="metric-card">
                <h3>Total Items</h3>
                <div className="metric-value">{stats.totalItems || 0}</div>
                <div className="metric-description">Items in inventory</div>
              </div>
              <div className="metric-card">
                <h3>Available Items</h3>
                <div className="metric-value">{stats.availableItems || 0}</div>
                <div className="metric-description">Items in stock</div>
              </div>
              <div className="metric-card">
                <h3>Low Stock Items</h3>
                <div className="metric-value">{stats.lowStockItems || 0}</div>
                <div className="metric-description">Items running low</div>
              </div>
              <div className="metric-card">
                <h3>Out of Stock</h3>
                <div className="metric-value">{stats.outOfStockItems || 0}</div>
                <div className="metric-description">Items out of stock</div>
              </div>
              <div className="metric-card">
                <h3>Total Value</h3>
                <div className="metric-value">${(stats.totalValue || 0).toFixed(2)}</div>
                <div className="metric-description">Total inventory value</div>
              </div>
            </div>

            <div className="chart-container">
              <h3 className="chart-title">Recent Inventory Items</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.slice(0, 10).map((item) => (
                    <tr key={item._id}>
                      <td>{item.itemName}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      <td>${item.totalValue.toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${item.status}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{item.supplierName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="inventory-section">
            {/* Enhanced Search and Filter Section */}
            <div className="inventory-controls">
              <div className="search-section">
                <div className="search-input-container">
                  <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, description, supplier, or category..."
                    className="search-input enhanced"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button 
                      className="clear-search"
                      onClick={() => setSearchTerm("")}
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              <div className="filter-section">
                <div className="filter-group">
                  <label className="filter-label">Status</label>
                  <select
                    className="filter-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">Category</label>
                  <select
                    className="filter-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>📦 {category}</option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label className="filter-label">Sort By</label>
                  <select
                    className="filter-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="itemName">Name</option>
                    <option value="quantity">Quantity</option>
                    <option value="unitPrice">Unit Price</option>
                    <option value="totalValue">Total Value</option>
                    <option value="category">Category</option>
                    <option value="status">Status</option>
                  </select>
                </div>
                
                <button 
                  className="sort-order-btn"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              
              <div className="action-section">
                <div className="view-toggle">
                  <button 
                    className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    title="Table View"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="15" x2="21" y2="15"></line>
                      <line x1="3" y1="9" x2="7" y2="9"></line>
                      <line x1="3" y1="15" x2="7" y2="15"></line>
                    </svg>
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </button>
                </div>
                
                <button className="add-item-btn" onClick={() => openModal("item")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add New Item
                </button>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="results-summary">
              <span className="results-count">
                Showing {filteredItems.length} of {inventoryItems.length} items
              </span>
              {(searchTerm || filterStatus !== 'all' || filterCategory !== 'all') && (
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterStatus("all")
                    setFilterCategory("all")
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="table-container">
                <table className="data-table enhanced">
                  <thead>
                    <tr>
                      <th>Item Details</th>
                      <th>Stock Info</th>
                      <th>Pricing</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item._id} className="table-row">
                        <td className="item-details">
                          <div className="item-info">
                            <h4 className="item-name">{item.itemName}</h4>
                            <p className="item-description">{item.description || 'No description'}</p>
                            <span className="supplier-info">📦 {item.supplierName}</span>
                          </div>
                        </td>
                        <td className="stock-info">
                          <div className="quantity-display">
                            <span className="quantity-number">{item.quantity}</span>
                            <span className="quantity-unit">{item.unit}</span>
                          </div>
                        </td>
                        <td className="pricing-info">
                          <div className="price-display">
                            <div className="unit-price">${item.unitPrice.toFixed(2)} per {item.unit}</div>
                            <div className="total-value">Total: ${item.totalValue.toFixed(2)}</div>
                          </div>
                        </td>
                        <td className="status-cell">
                          <div className={`status-indicator status-${item.status}`}>
                            <span className="status-icon">
                              {item.status === 'available'}
                              {item.status === 'low_stock' }
                              {item.status === 'out_of_stock' }
                            </span>
                            <span className="status-text">
                              {item.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="category-cell">
                          <span className="category-badge">{item.category}</span>
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons modern">
                            <button
                              className="action-btn use-btn"
                              onClick={() => openModal("use", item)}
                              title="Use Item"
                              disabled={item.quantity === 0}
                            >
                              Use
                            </button>
                            <button
                              className="action-btn quantity-btn"
                              onClick={() => openModal("quantity", item)}
                              title="Update Quantity"
                            >
                              Qty
                            </button>
                            <button
                              className="action-btn edit-btn"
                              onClick={() => openModal("item", item)}
                              title="Edit Item"
                            >
                              Edit
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(item._id)}
                              title="Delete Item"
                            >
                              Del
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid-container">
                {filteredItems.map((item) => (
                  <div key={item._id} className="inventory-card">
                    <div className="card-header">
                      <h3 className="card-title">{item.itemName}</h3>
                      <div className={`status-indicator status-${item.status}`}>
                        <span className="status-icon">
                          {item.status === 'available' }
                          {item.status === 'low_stock' }
                          {item.status === 'out_of_stock'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-content">
                      <p className="card-description">{item.description || 'No description available'}</p>
                      
                      <div className="card-details">
                        <div className="detail-row">
                          <span className="detail-label">Quantity:</span>
                          <span className="detail-value">{item.quantity} {item.unit}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Unit Price:</span>
                          <span className="detail-value">${item.unitPrice.toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Total Value:</span>
                          <span className="detail-value total-value">${item.totalValue.toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Category:</span>
                          <span className="detail-value category">{item.category}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Supplier:</span>
                          <span className="detail-value">{item.supplierName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-actions">
                      <button
                        className="card-action-btn primary"
                        onClick={() => openModal("use", item)}
                        disabled={item.quantity === 0}
                      >
                        Use Item
                      </button>
                      <button
                        className="card-action-btn secondary"
                        onClick={() => openModal("quantity", item)}
                      >
                        Update Qty
                      </button>
                      <button
                        className="card-action-btn secondary"
                        onClick={() => openModal("item", item)}
                      >
                        Edit
                      </button>
                      <button
                        className="card-action-btn danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No items found</h3>
                <p>
                  {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' 
                    ? 'Try adjusting your search or filters' 
                    : 'Start by adding your first inventory item'
                  }
                </p>
                <button className="add-item-btn" onClick={() => openModal("item")}>
                  Add Your First Item
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "alerts" && (
          <div>
            <div className="chart-container">
              <h3 className="chart-title">Stock Alerts</h3>
              <p>Items that need attention due to low or out of stock status</p>
              
              {stats.lowStockAlerts && stats.lowStockAlerts.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Current Quantity</th>
                      <th>Minimum Stock</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowStockAlerts.map((item) => (
                      <tr key={item._id}>
                        <td>{item.itemName}</td>
                        <td>{item.quantity}</td>
                        <td>{item.minimumStock}</td>
                        <td>
                          <span className={`status-badge status-${item.status}`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <button
                            className="supbtn"
                            onClick={() => openModal("quantity", item)}
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No stock alerts at this time. All items are adequately stocked.</p>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content enhanced">
              <div className="modal-header">
                <div className="modal-title-section">
                  <div className="modal-icon">
                    {modalType === "quantity" && "📊"}
                    {modalType === "use" && "🔄"}
                    {modalType === "item" && (editingItem ? "✏️" : "➕")}
                  </div>
                  <h2>
                    {modalType === "quantity" 
                      ? "Update Quantity" 
                      : modalType === "use"
                        ? "Use Item"
                        : editingItem 
                          ? "Edit Inventory Item" 
                          : "Add New Inventory Item"
                    }
                  </h2>
                </div>
                <button className="close-btn" onClick={closeModal}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                {modalType === "quantity" ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Current Quantity: {editingItem?.quantity} {editingItem?.unit}</label>
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Quantity *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.quantity || ""}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        required
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reason for Change</label>
                      <textarea
                        className="form-textarea"
                        value={formData.reason || ""}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        placeholder="Enter reason for quantity change..."
                      />
                    </div>
                  </>
                ) : modalType === "use" ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Item: {editingItem?.itemName}</label>
                      <p className="form-help">Available Stock: {formData.availableStock} {formData.unit}</p>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantity to Use *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.quantityUsed || ""}
                        onChange={(e) => setFormData({...formData, quantityUsed: e.target.value})}
                        required
                        min="1"
                        max={formData.availableStock}
                      />
                      <small className="form-help">Maximum: {formData.availableStock} {formData.unit}</small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Reason for Use *</label>
                      <select
                        className="form-select"
                        value={formData.reason || ""}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        required
                      >
                        <option value="">Select reason...</option>
                        <option value="Production use">Production use</option>
                        <option value="Quality testing">Quality testing</option>
                        <option value="Sample creation">Sample creation</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Damaged/Defective">Damaged/Defective</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Used By</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.usedBy || ""}
                        onChange={(e) => setFormData({...formData, usedBy: e.target.value})}
                        placeholder="Enter name of person using the item..."
                      />
                    </div>
                  </>
                ) : (
                  <div className="form-sections">
                    {/* Basic Information Section */}
                    <div className="form-section">
                      <h3 className="section-title">
                        <span className="section-icon">📝</span>
                        Basic Information
                      </h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Item Name *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.itemName || ""}
                            onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                            required
                            placeholder="Enter item name"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-textarea"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Enter item description (optional)"
                            rows="3"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Category</label>
                          <div className="input-with-suggestions">
                            <input
                              type="text"
                              className="form-input"
                              value={formData.category || "Materials"}
                              onChange={(e) => setFormData({...formData, category: e.target.value})}
                              placeholder="Enter or select category"
                              list="categories"
                            />
                            <datalist id="categories">
                              {categories.map(category => (
                                <option key={category} value={category} />
                              ))}
                              <option value="Materials" />
                              <option value="Tools" />
                              <option value="Equipment" />
                              <option value="Supplies" />
                              <option value="Components" />
                            </datalist>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Inventory Details Section */}
                    <div className="form-section">
                      <h3 className="section-title">
                        <span className="section-icon">📦</span>
                        Inventory Details
                      </h3>
                      <div className="form-row two-columns">
                        <div className="form-group">
                          <label className="form-label">Quantity *</label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.quantity || ""}
                            onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                            required
                            min="0"
                            placeholder="0"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Unit *</label>
                          <select
                            className="form-select"
                            value={formData.unit || "pieces"}
                            onChange={(e) => setFormData({...formData, unit: e.target.value})}
                            required
                          >
                            <option value="pieces">📦 Pieces</option>
                            <option value="meters">📏 Meters</option>
                            <option value="yards">📐 Yards</option>
                            <option value="kg">⚖️ Kilograms</option>
                            <option value="lbs">⚖️ Pounds</option>
                            <option value="rolls">🗞️ Rolls</option>
                            <option value="boxes">📦 Boxes</option>
                            <option value="liters">🥤 Liters</option>
                            <option value="gallons">🪣 Gallons</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Minimum Stock Level</label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.minimumStock || 10}
                            onChange={(e) => setFormData({...formData, minimumStock: parseInt(e.target.value)})}
                            min="0"
                            placeholder="10"
                          />
                          <small className="form-help">Alert when stock falls below this level</small>
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Storage Location</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.location || "Main Warehouse"}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            placeholder="e.g., Main Warehouse, Section A, Shelf 1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Supplier Section */}
                    <div className="form-section">
                      <h3 className="section-title">
                        <span className="section-icon">💰</span>
                        Pricing & Supplier
                      </h3>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Unit Price *</label>
                          <div className="price-input-container">
                            <span className="currency-symbol">$</span>
                            <input
                              type="number"
                              step="0.01"
                              className="form-input price-input"
                              value={formData.unitPrice || ""}
                              onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value)})}
                              required
                              min="0"
                              placeholder="0.00"
                            />
                          </div>
                          {formData.quantity && formData.unitPrice && (
                            <small className="form-help">
                              Total Value: ${(formData.quantity * formData.unitPrice).toFixed(2)}
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Supplier *</label>
                          <select
                            className="form-select"
                            value={formData.supplierId || ""}
                            onChange={(e) => {
                              const supplier = suppliers.find(s => s._id === e.target.value)
                              setFormData({
                                ...formData, 
                                supplierId: e.target.value,
                                supplierName: supplier ? supplier.name : ""
                              })
                            }}
                            required
                          >
                            <option value="">Select a supplier...</option>
                            {suppliers.map(supplier => (
                              <option key={supplier._id} value={supplier._id}>
                                🏢 {supplier.name}
                              </option>
                            ))}
                          </select>
                          {suppliers.length === 0 && (
                            <small className="form-help warning">
                              ⚠️ No suppliers available. Please add suppliers first.
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {modalType === "quantity" ? "Update Quantity" : editingItem ? "Update Item" : "Create Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
