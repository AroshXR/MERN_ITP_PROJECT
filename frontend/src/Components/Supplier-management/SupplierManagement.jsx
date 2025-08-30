"use client"
import"./SupplierManagement.css"
import { useState } from "react"

// Mock data for demonstration
const mockSuppliers = [
  {
    id: 1,
    name: "Fashion Forward Inc.",
    contact: "John Smith",
    email: "john@fashionforward.com",
    phone: "+1-555-0123",
    status: "active",
    totalOrders: 45,
    lastOrder: "2024-01-15",
  },
  {
    id: 2,
    name: "Textile Masters Ltd.",
    contact: "Sarah Johnson",
    email: "sarah@textilemaster.com",
    phone: "+1-555-0124",
    status: "active",
    totalOrders: 32,
    lastOrder: "2024-01-12",
  },
  {
    id: 3,
    name: "Quality Fabrics Co.",
    contact: "Mike Wilson",
    email: "mike@qualityfabrics.com",
    phone: "+1-555-0125",
    status: "inactive",
    totalOrders: 18,
    lastOrder: "2023-12-20",
  },
  {
    id: 4,
    name: "Premium Clothing Supply",
    contact: "Lisa Brown",
    email: "lisa@premiumclothing.com",
    phone: "+1-555-0126",
    status: "active",
    totalOrders: 67,
    lastOrder: "2024-01-18",
  },
]

const mockOrders = [
  {
    id: 1,
    supplierId: 1,
    supplierName: "Fashion Forward Inc.",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-25",
    status: "pending",
    total: 2500.0,
    items: "Cotton T-shirts (100), Denim Jeans (50)",
  },
  {
    id: 2,
    supplierId: 2,
    supplierName: "Textile Masters Ltd.",
    orderDate: "2024-01-12",
    deliveryDate: "2024-01-22",
    status: "active",
    total: 1800.0,
    items: "Silk Scarves (75), Wool Sweaters (25)",
  },
  {
    id: 3,
    supplierId: 4,
    supplierName: "Premium Clothing Supply",
    orderDate: "2024-01-18",
    deliveryDate: "2024-01-28",
    status: "active",
    total: 3200.0,
    items: "Designer Dresses (30), Leather Jackets (20)",
  },
  {
    id: 4,
    supplierId: 1,
    supplierName: "Fashion Forward Inc.",
    orderDate: "2024-01-10",
    deliveryDate: "2024-01-20",
    status: "completed",
    total: 1500.0,
    items: "Basic T-shirts (200)",
  },
]

export default function SupplierManagement() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [suppliers, setSuppliers] = useState(mockSuppliers)
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("")
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [reportFilters, setReportFilters] = useState({
    dateFrom: "",
    dateTo: "",
    supplierFilter: "all",
    statusFilter: "all",
    reportType: "summary",
  })
  const [viewingReport, setViewingReport] = useState(false)
  const [reportContent, setReportContent] = useState("")

  // Dashboard metrics
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const totalValue = orders.reduce((sum, order) => sum + order.total, 0)

  // Search functionality
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredOrders = orders.filter(
    (order) =>
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)
    if (item) {
      setFormData(item)
    } else {
      setFormData(
        type === "supplier"
          ? { name: "", contact: "", email: "", phone: "", status: "active" }
          : {
              supplierId: "",
              supplierName: "",
              orderDate: "",
              deliveryDate: "",
              status: "pending",
              total: "",
              items: "",
            },
      )
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType("")
    setEditingItem(null)
    setFormData({})
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (modalType === "supplier") {
      if (editingItem) {
        setSuppliers(suppliers.map((s) => (s.id === editingItem.id ? { ...formData, id: editingItem.id } : s)))
      } else {
        const newSupplier = { ...formData, id: Date.now(), totalOrders: 0, lastOrder: "Never" }
        setSuppliers([...suppliers, newSupplier])
      }
    } else if (modalType === "order") {
      if (editingItem) {
        setOrders(orders.map((o) => (o.id === editingItem.id ? { ...formData, id: editingItem.id } : o)))
      } else {
        const supplier = suppliers.find((s) => s.id === Number.parseInt(formData.supplierId))
        const newOrder = {
          ...formData,
          id: Date.now(),
          supplierId: Number.parseInt(formData.supplierId),
          supplierName: supplier ? supplier.name : "",
          total: Number.parseFloat(formData.total),
        }
        setOrders([...orders, newOrder])
      }
    }

    closeModal()
  }

  const handleDelete = (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === "supplier") {
        setSuppliers(suppliers.filter((s) => s.id !== id))
        setOrders(orders.filter((o) => o.supplierId !== id))
      } else if (type === "order") {
        setOrders(orders.filter((o) => o.id !== id))
      }
    }
  }

  const generateReport = () => {
    const filteredSuppliers =
      reportFilters.supplierFilter === "all"
        ? suppliers
        : suppliers.filter((s) => s.id === Number.parseInt(reportFilters.supplierFilter))

    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.orderDate)
      const fromDate = reportFilters.dateFrom ? new Date(reportFilters.dateFrom) : new Date("2000-01-01")
      const toDate = reportFilters.dateTo ? new Date(reportFilters.dateTo) : new Date("2030-12-31")

      const dateMatch = orderDate >= fromDate && orderDate <= toDate
      const statusMatch = reportFilters.statusFilter === "all" || order.status === reportFilters.statusFilter
      const supplierMatch =
        reportFilters.supplierFilter === "all" || order.supplierId === Number.parseInt(reportFilters.supplierFilter)

      return dateMatch && statusMatch && supplierMatch
    })

    const reportData = {
      totalSuppliers: filteredSuppliers.length,
      activeSuppliers: filteredSuppliers.filter((s) => s.status === "active").length,
      totalOrders: filteredOrders.length,
      pendingOrders: filteredOrders.filter((o) => o.status === "pending").length,
      completedOrders: filteredOrders.filter((o) => o.status === "completed").length,
      totalValue: filteredOrders.reduce((sum, order) => sum + order.total, 0),
      averageOrderValue:
        filteredOrders.length > 0
          ? filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length
          : 0,
    }

    let content = ""

    if (reportFilters.reportType === "summary") {
      content = `SUPPLIER MANAGEMENT SUMMARY REPORT
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Report Period: ${reportFilters.dateFrom || "All time"} to ${reportFilters.dateTo || "Present"}

=== EXECUTIVE SUMMARY ===
Total Suppliers: ${reportData.totalSuppliers}
Active Suppliers: ${reportData.activeSuppliers}
Inactive Suppliers: ${reportData.totalSuppliers - reportData.activeSuppliers}
Total Orders: ${reportData.totalOrders}
Pending Orders: ${reportData.pendingOrders}
Active Orders: ${filteredOrders.filter((o) => o.status === "active").length}
Completed Orders: ${reportData.completedOrders}
Total Order Value: $${reportData.totalValue.toFixed(2)}
Average Order Value: $${reportData.averageOrderValue.toFixed(2)}

=== SUPPLIER PERFORMANCE ===
${filteredSuppliers
  .map((s) => {
    const supplierOrders = filteredOrders.filter((o) => o.supplierId === s.id)
    const supplierValue = supplierOrders.reduce((sum, order) => sum + order.total, 0)
    return `${s.name}:
  - Status: ${s.status.toUpperCase()}
  - Contact: ${s.contact} (${s.email})
  - Orders in Period: ${supplierOrders.length}
  - Total Value: $${supplierValue.toFixed(2)}
  - Average Order: $${supplierOrders.length > 0 ? (supplierValue / supplierOrders.length).toFixed(2) : "0.00"}`
  })
  .join("\n\n")}

=== ORDER ANALYSIS ===
Orders by Status:
- Pending: ${reportData.pendingOrders} (${reportData.totalOrders > 0 ? ((reportData.pendingOrders / reportData.totalOrders) * 100).toFixed(1) : 0}%)
- Active: ${filteredOrders.filter((o) => o.status === "active").length} (${reportData.totalOrders > 0 ? ((filteredOrders.filter((o) => o.status === "active").length / reportData.totalOrders) * 100).toFixed(1) : 0}%)
- Completed: ${reportData.completedOrders} (${reportData.totalOrders > 0 ? ((reportData.completedOrders / reportData.totalOrders) * 100).toFixed(1) : 0}%)

Recent Orders:
${filteredOrders
  .slice(-10)
  .map((o) => `- Order #${o.id}: ${o.supplierName} - $${o.total.toFixed(2)} (${o.status}) - ${o.orderDate}`)
  .join("\n")}`
    } else if (reportFilters.reportType === "detailed") {
      content = `DETAILED SUPPLIER MANAGEMENT REPORT
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Report Period: ${reportFilters.dateFrom || "All time"} to ${reportFilters.dateTo || "Present"}

=== DETAILED SUPPLIER INFORMATION ===
${filteredSuppliers
  .map((s) => {
    const supplierOrders = filteredOrders.filter((o) => o.supplierId === s.id)
    return `
SUPPLIER: ${s.name}
Contact Person: ${s.contact}
Email: ${s.email}
Phone: ${s.phone}
Status: ${s.status.toUpperCase()}
Total Orders (All Time): ${s.totalOrders}
Orders in Report Period: ${supplierOrders.length}
Last Order Date: ${s.lastOrder}

Orders in Period:
${supplierOrders
  .map(
    (o) => `  - Order #${o.id}: ${o.orderDate} | $${o.total.toFixed(2)} | ${o.status.toUpperCase()}
    Items: ${o.items}
    Delivery: ${o.deliveryDate}`,
  )
  .join("\n")}
  `
  })
  .join("\n" + "=".repeat(80) + "\n")}

=== DETAILED ORDER INFORMATION ===
${filteredOrders
  .map(
    (o) => `
ORDER #${o.id}
Supplier: ${o.supplierName}
Order Date: ${o.orderDate}
Delivery Date: ${o.deliveryDate}
Status: ${o.status.toUpperCase()}
Total Amount: $${o.total.toFixed(2)}
Items: ${o.items}
`,
  )
  .join("\n" + "-".repeat(50) + "\n")}`
    } else if (reportFilters.reportType === "financial") {
      const monthlyData = {}
      filteredOrders.forEach((order) => {
        const month = order.orderDate.substring(0, 7)
        if (!monthlyData[month]) {
          monthlyData[month] = { orders: 0, value: 0 }
        }
        monthlyData[month].orders++
        monthlyData[month].value += order.total
      })

      content = `FINANCIAL ANALYSIS REPORT
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Report Period: ${reportFilters.dateFrom || "All time"} to ${reportFilters.dateTo || "Present"}

=== FINANCIAL SUMMARY ===
Total Order Value: $${reportData.totalValue.toFixed(2)}
Average Order Value: $${reportData.averageOrderValue.toFixed(2)}
Number of Orders: ${reportData.totalOrders}

Highest Value Order: $${Math.max(...filteredOrders.map((o) => o.total)).toFixed(2)}
Lowest Value Order: $${Math.min(...filteredOrders.map((o) => o.total)).toFixed(2)}

=== MONTHLY BREAKDOWN ===
${Object.entries(monthlyData)
  .sort()
  .map(
    ([month, data]) =>
      `${month}: ${data.orders} orders, $${data.value.toFixed(2)} total, $${(data.value / data.orders).toFixed(2)} average`,
  )
  .join("\n")}

=== SUPPLIER FINANCIAL PERFORMANCE ===
${filteredSuppliers
  .map((s) => {
    const supplierOrders = filteredOrders.filter((o) => o.supplierId === s.id)
    const supplierValue = supplierOrders.reduce((sum, order) => sum + order.total, 0)
    const percentage = reportData.totalValue > 0 ? ((supplierValue / reportData.totalValue) * 100).toFixed(1) : 0
    return `${s.name}: $${supplierValue.toFixed(2)} (${percentage}% of total)`
  })
  .join("\n")}

=== ORDER STATUS FINANCIAL BREAKDOWN ===
Pending Orders Value: $${filteredOrders
        .filter((o) => o.status === "pending")
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2)}
Active Orders Value: $${filteredOrders
        .filter((o) => o.status === "active")
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2)}
Completed Orders Value: $${filteredOrders
        .filter((o) => o.status === "completed")
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2)}`
    } else if (reportFilters.reportType === "suppliers") {
      content = `SUPPLIERS DATA EXPORT
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

${suppliers
  .map(
    (s) => `Supplier: ${s.name}
Contact: ${s.contact}
Email: ${s.email}
Phone: ${s.phone}
Status: ${s.status.toUpperCase()}
Total Orders: ${s.totalOrders}
Last Order: ${s.lastOrder}
`,
  )
  .join("\n" + "-".repeat(50) + "\n")}`
    } else if (reportFilters.reportType === "orders") {
      content = `ORDERS DATA EXPORT
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

${orders
  .map(
    (o) => `Order ID: ${o.id}
Supplier: ${o.supplierName}
Order Date: ${o.orderDate}
Delivery Date: ${o.deliveryDate}
Status: ${o.status.toUpperCase()}
Total: $${o.total.toFixed(2)}
Items: ${o.items}
`,
  )
  .join("\n" + "-".repeat(50) + "\n")}`
    }

    setReportContent(content)
    setViewingReport(true)
  }

  const generateCSVReport = () => {
    const csvData = []

    if (reportFilters.reportType === "suppliers") {
      csvData.push(["Supplier Name", "Contact Person", "Email", "Phone", "Status", "Total Orders", "Last Order"])
      suppliers.forEach((s) => {
        csvData.push([s.name, s.contact, s.email, s.phone, s.status, s.totalOrders, s.lastOrder])
      })
    } else {
      csvData.push(["Order ID", "Supplier", "Order Date", "Delivery Date", "Status", "Total", "Items"])
      orders.forEach((o) => {
        csvData.push([o.id, o.supplierName, o.orderDate, o.deliveryDate, o.status, o.total, o.items])
      })
    }

    const csvContent = csvData.map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `supplier-${reportFilters.reportType}-data-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="supplier-container">
      <div className="dashboard-header">
        <h1>Supplier Management System</h1>
        <p>Manage your clothing store suppliers and orders efficiently</p>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`nav-tab ${activeTab === "suppliers" ? "active" : ""}`}
          onClick={() => setActiveTab("suppliers")}
        >
          Suppliers
        </button>
        <button className={`nav-tab ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
          Orders
        </button>
        <button
          className={`nav-tab ${activeTab === "reports" ? "active" : ""}`}
          onClick={() => setActiveTab("reports")}
        >
          Reports
        </button>
      </div>

      {activeTab === "dashboard" && (
        <div>
          <div className="dashboard-grid">
            <div className="metric-card">
              <h3>Total Suppliers</h3>
              <div className="metric-value">{totalSuppliers}</div>
              <div className="metric-description">Registered suppliers in system</div>
            </div>
            <div className="metric-card">
              <h3>Active Suppliers</h3>
              <div className="metric-value">{activeSuppliers}</div>
              <div className="metric-description">Currently active suppliers</div>
            </div>
            <div className="metric-card">
              <h3>Total Orders</h3>
              <div className="metric-value">{totalOrders}</div>
              <div className="metric-description">All orders placed</div>
            </div>
            <div className="metric-card">
              <h3>Pending Orders</h3>
              <div className="metric-value">{pendingOrders}</div>
              <div className="metric-description">Orders awaiting processing</div>
            </div>
            <div className="metric-card">
              <h3>Total Order Value</h3>
              <div className="metric-value">${totalValue.toFixed(2)}</div>
              <div className="metric-description">Combined value of all orders</div>
            </div>
          </div>

          <div className="chart-container">
            <h3 className="chart-title">Recent Activity</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Last Order</th>
                  <th>Status</th>
                  <th>Total Orders</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.slice(0, 5).map((supplier) => (
                  <tr key={supplier.id}>
                    <td>{supplier.name}</td>
                    <td>{supplier.lastOrder}</td>
                    <td>
                      <span className={`status-badge status-${supplier.status}`}>{supplier.status}</span>
                    </td>
                    <td>{supplier.totalOrders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "suppliers" && (
        <div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search suppliers..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => openModal("supplier")}>
              Add Supplier
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Total Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.contact}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.phone}</td>
                  <td>
                    <span className={`status-badge status-${supplier.status}`}>{supplier.status}</span>
                  </td>
                  <td>{supplier.totalOrders}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => openModal("supplier", supplier)}
                      style={{ marginRight: "5px" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-destructive btn-small"
                      onClick={() => handleDelete("supplier", supplier.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search orders..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => openModal("order")}>
              Add Order
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.supplierName}</td>
                  <td>{order.orderDate}</td>
                  <td>{order.deliveryDate}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => openModal("order", order)}
                      style={{ marginRight: "5px" }}
                    >
                      Edit
                    </button>
                    <button className="btn btn-destructive btn-small" onClick={() => handleDelete("order", order.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "reports" && (
        <div>
          <div className="chart-container">
            <h3 className="chart-title">Advanced Report Generation</h3>
            <p>Generate comprehensive reports with custom filters and view them directly.</p>

            <div className="report-filters">
              <div className="filter-row">
                <div className="form-group">
                  <label className="form-label">Report Type</label>
                  <select
                    className="form-select"
                    value={reportFilters.reportType}
                    onChange={(e) => setReportFilters({ ...reportFilters, reportType: e.target.value })}
                  >
                    <option value="summary">Summary Report</option>
                    <option value="detailed">Detailed Report</option>
                    <option value="financial">Financial Analysis</option>
                    <option value="suppliers">Suppliers Data</option>
                    <option value="orders">Orders Data</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Date From</label>
                  <input
                    type="date"
                    className="form-input"
                    value={reportFilters.dateFrom}
                    onChange={(e) => setReportFilters({ ...reportFilters, dateFrom: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date To</label>
                  <input
                    type="date"
                    className="form-input"
                    value={reportFilters.dateTo}
                    onChange={(e) => setReportFilters({ ...reportFilters, dateTo: e.target.value })}
                  />
                </div>
              </div>

              <div className="filter-row">
                <div className="form-group">
                  <label className="form-label">Supplier Filter</label>
                  <select
                    className="form-select"
                    value={reportFilters.supplierFilter}
                    onChange={(e) => setReportFilters({ ...reportFilters, supplierFilter: e.target.value })}
                  >
                    <option value="all">All Suppliers</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status Filter</label>
                  <select
                    className="form-select"
                    value={reportFilters.statusFilter}
                    onChange={(e) => setReportFilters({ ...reportFilters, statusFilter: e.target.value })}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="report-actions">
              <button className="btn btn-primary" onClick={generateReport}>
                View Report
              </button>
              {viewingReport && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setViewingReport(false)}
                  style={{ marginLeft: "10px" }}
                >
                  Hide Report
                </button>
              )}
            </div>

            {viewingReport && (
              <div className="report-viewer">
                <h4>Report Content</h4>
                <pre className="report-content">{reportContent}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingItem ? "Edit" : "Add"} {modalType === "supplier" ? "Supplier" : "Order"}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {modalType === "supplier" ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.contact || ""}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status || "active"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Supplier</label>
                    <select
                      className="form-select"
                      value={formData.supplierId || ""}
                      onChange={(e) => {
                        const supplier = suppliers.find((s) => s.id === Number.parseInt(e.target.value))
                        setFormData({
                          ...formData,
                          supplierId: e.target.value,
                          supplierName: supplier ? supplier.name : "",
                        })
                      }}
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers
                        .filter((s) => s.status === "active")
                        .map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Order Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.orderDate || ""}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Delivery Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.deliveryDate || ""}
                      onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status || "pending"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={formData.total || ""}
                      onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Items</label>
                    <textarea
                      className="form-textarea"
                      value={formData.items || ""}
                      onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                      placeholder="Describe the items in this order..."
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
