"use client"
import Footer from "../Footer/Footer"
import NavBar from "../NavBar/navBar"
import "./InventoryManagement.css"
import { useState, useEffect } from "react"

export default function InventoryManagement() {
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

  // Filter inventory items
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || item.status === filterStatus
    const matchesCategory = filterCategory === "all" || item.category === filterCategory
    
    return matchesSearch && matchesStatus && matchesCategory
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
        await fetchInventoryStats()
      } catch (error) {
        console.error('Error deleting item:', error)
        setError('Error deleting item. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="inventory-container">
        <div className="dashboard-header">
          <h1>Material Inventory Management</h1>
          <p>Loading...</p>
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
        <p>Track and manage your material inventory efficiently</p>
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
          <div>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search inventory items..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: 'auto', marginRight: '10px' }}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <select
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ width: 'auto', marginRight: '10px' }}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <button className="supbtn" onClick={() => openModal("item")}>
                Add Item
              </button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Supplier</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item.itemName}</td>
                    <td>{item.description || 'N/A'}</td>
                    <td>{item.quantity} {item.unit}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>${item.totalValue.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{item.supplierName}</td>
                    <td>{item.category}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => openModal("quantity", item)}
                          title="Update Quantity"
                        >
                          Qty
                        </button>
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => openModal("item", item)}
                          title="Edit Item"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-destructive btn-small"
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
                            className="btn btn-primary btn-small"
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

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>
                  {modalType === "quantity" 
                    ? "Update Quantity" 
                    : editingItem 
                      ? "Edit Inventory Item" 
                      : "Add New Inventory Item"
                  }
                </h2>
                <button className="close-btn" onClick={closeModal}>×</button>
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
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Item Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.itemName || ""}
                        onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-textarea"
                        value={formData.description || ""}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantity *</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.quantity || ""}
                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                        required
                        min="0"
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
                        <option value="pieces">Pieces</option>
                        <option value="meters">Meters</option>
                        <option value="yards">Yards</option>
                        <option value="kg">Kilograms</option>
                        <option value="lbs">Pounds</option>
                        <option value="rolls">Rolls</option>
                        <option value="boxes">Boxes</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Unit Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-input"
                        value={formData.unitPrice || ""}
                        onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value)})}
                        required
                        min="0"
                      />
                    </div>
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
                        <option value="">Select Supplier</option>
                        {suppliers.map(supplier => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.category || "Materials"}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.location || "Main Warehouse"}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Minimum Stock Level</label>
                      <input
                        type="number"
                        className="form-input"
                        value={formData.minimumStock || 10}
                        onChange={(e) => setFormData({...formData, minimumStock: parseInt(e.target.value)})}
                        min="0"
                      />
                    </div>
                  </>
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
