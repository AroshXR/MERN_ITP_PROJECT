"use client"
import Footer from "../Footer/Footer"
import NavBar from "../NavBar/navBar"
import "./SupplierManagement.css"
import { useState, useEffect } from "react"



export default function SupplierManagement() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [suppliers, setSuppliers] = useState([])
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("")
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [orderItems, setOrderItems] = useState([{ name: "", quantity: 1, unitPrice: 0 }])
  const [reportFilters, setReportFilters] = useState({
    dateFrom: "",
    dateTo: "",
    supplierFilter: "all",
    statusFilter: "all",
    reportType: "summary",
  })
  const [viewingReport, setViewingReport] = useState(false)
  const [reportContent, setReportContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")

  // API base URL
  const API_BASE_URL = "http://localhost:5001/supplier"

  // API functions
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch suppliers')
      }
      const data = await response.json()
      console.log('Fetched suppliers:', data)
      setSuppliers(data)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      setError('Failed to load suppliers')
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Failed to load orders')
    }
  }

  const createSupplier = async (supplierData) => {
    try {
      console.log('Sending supplier data:', supplierData)
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      })
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        throw new Error(errorData.message || errorData.error || 'Failed to create supplier')
      }
      const data = await response.json()
      console.log('Supplier created successfully:', data)
      return data
    } catch (error) {
      console.error('Error creating supplier:', error)
      throw error
    }
  }

  const updateSupplier = async (id, supplierData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplierData),
      })
      if (!response.ok) throw new Error('Failed to update supplier')
      const data = await response.json()
      setSuppliers(suppliers.map(s => s._id === id ? data : s))
      return data
    } catch (error) {
      console.error('Error updating supplier:', error)
      throw error
    }
  }

  const deleteSupplier = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete supplier')
      setSuppliers(suppliers.filter(s => s._id !== id))
      setOrders(orders.filter(o => o.supplierId !== id))
    } catch (error) {
      console.error('Error deleting supplier:', error)
      throw error
    }
  }

  const createOrder = async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      if (!response.ok) throw new Error('Failed to create order')
      const data = await response.json()
      setOrders([...orders, data])
      return data
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  const updateOrder = async (id, orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })
      if (!response.ok) throw new Error('Failed to update order')
      const data = await response.json()

      // Handle different response formats
      const updatedOrder = data.order || data
      const inventoryMessage = data.message || null

      setOrders(orders.map(o => o._id === id ? updatedOrder : o))

      // Show inventory message if items were added
      if (inventoryMessage) {
        setSuccessMessage(inventoryMessage)
        setTimeout(() => setSuccessMessage(""), 5000)
      }

      return updatedOrder
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }

  const deleteOrder = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete order')
      setOrders(orders.filter(o => o._id !== id))
    } catch (error) {
      console.error('Error deleting order:', error)
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

        await Promise.all([fetchSuppliers(), fetchOrders()])
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load data: ' + error.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Dashboard metrics
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const totalValue = orders.reduce((sum, order) => sum + order.total, 0)

  // Search functionality
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      (supplier.name && supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.companyDetails?.registrationNumber &&
        supplier.companyDetails.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredOrders = orders.filter(
    (order) =>
      (order.supplierName && order.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.items && order.items.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.status && order.status.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Order items management
  const addOrderItem = () => {
    setOrderItems([...orderItems, { name: "", quantity: 1, unitPrice: 0 }])
  }

  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index))
    }
  }

  const updateOrderItem = (index, field, value) => {
    const updatedItems = orderItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    )
    setOrderItems(updatedItems)
  }

  const formatItemsForBackend = (items) => {
    return items
      .filter(item => item.name.trim() && item.quantity > 0)
      .map(item => `${item.name.trim()} x${item.quantity}`)
      .join(", ")
  }

  const calculateTotalFromItems = (items) => {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity) || 0)
    }, 0)
  }

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type)
    setEditingItem(item)
    setError(null) // Clear any existing errors
    setSuccessMessage("") // Clear any existing success messages
    if (item) {
      setFormData(item)
      // If editing an order, parse the items string back to array format
      if (type === "order" && item.items) {
        const parsedItems = item.items.split(", ").map(itemStr => {
          const match = itemStr.match(/^(.+?)\s+x(\d+)$/)
          if (match) {
            return { name: match[1].trim(), quantity: parseInt(match[2]), unitPrice: 0 }
          }
          return { name: itemStr, quantity: 1, unitPrice: 0 }
        })
        setOrderItems(parsedItems.length > 0 ? parsedItems : [{ name: "", quantity: 1, unitPrice: 0 }])
      }
    } else {
      setFormData(
        type === "supplier"
          ? { name: "", contact: "", email: "", phone: "", status: "active", companyDetails: { registrationNumber: "" } }
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
      // Reset order items for new orders
      if (type === "order") {
        setOrderItems([{ name: "", quantity: 1, unitPrice: 0 }])
      }
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType("")
    setEditingItem(null)
    setFormData({})
    setOrderItems([{ name: "", quantity: 1, unitPrice: 0 }])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form data
    if (modalType === "supplier") {
      if (!formData.name || !formData.contact || !formData.email || !formData.phone) {
        alert('Please fill in all required fields for supplier')
        return
      }
    } else if (modalType === "order") {
      const hasValidItems = orderItems.some(item => item.name.trim() && item.quantity > 0)
      if (!formData.supplierId || !formData.orderDate || !formData.deliveryDate || !hasValidItems) {
        alert('Please fill in all required fields for order and add at least one valid item')
        return
      }
    }

    try {
      console.log('Form submission started for:', modalType)
      console.log('Form data:', formData)

      if (modalType === "supplier") {
        if (editingItem) {
          console.log('Updating existing supplier:', editingItem._id)
          await updateSupplier(editingItem._id, formData)
        } else {
          console.log('Creating new supplier')
          const newSupplier = await createSupplier(formData)
          console.log('Supplier created successfully:', newSupplier)
        }
      } else if (modalType === "order") {
        if (editingItem) {
          await updateOrder(editingItem._id, formData)
        } else {
          const supplier = suppliers.find((s) => s._id === formData.supplierId)
          const formattedItems = formatItemsForBackend(orderItems)
          const calculatedTotal = calculateTotalFromItems(orderItems)
          const orderData = {
            ...formData,
            supplierId: formData.supplierId,
            supplierName: supplier ? supplier.name : "",
            total: calculatedTotal,
            items: formattedItems,
          }
          await createOrder(orderData)
        }
      }

      // Show success message only if not already set (e.g., by inventory update)
      if (!successMessage) {
        setSuccessMessage(`${modalType === "supplier" ? "Supplier" : "Order"} ${editingItem ? "updated" : "created"} successfully!`)
        setTimeout(() => setSuccessMessage(""), 3000)
      }

      // Refresh the data to ensure we have the latest state
      if (modalType === "supplier") {
        await fetchSuppliers()
      } else if (modalType === "order") {
        await fetchOrders()
      }

      console.log('Form submission completed successfully')
    } catch (error) {
      console.error('Error submitting form:', error)
      setError(`Error saving ${modalType}: ${error.message}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      // Always reset form data and close modal
      setFormData({})
      setOrderItems([{ name: "", quantity: 1, unitPrice: 0 }])
      closeModal()
    }
  }

  const handleDelete = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        if (type === "supplier") {
          await deleteSupplier(id)
        } else if (type === "order") {
          await deleteOrder(id)
        }
      } catch (error) {
        console.error('Error deleting item:', error)
        alert('Error deleting item. Please try again.')
      }
    }
  }

  // Helper function to validate date filters
  const validateDateFilters = () => {
    if (reportFilters.dateFrom && reportFilters.dateTo) {
      const fromDate = new Date(reportFilters.dateFrom)
      const toDate = new Date(reportFilters.dateTo)

      if (fromDate > toDate) {
        alert('Error: "Date From" cannot be later than "Date To". Please check your date range.')
        return false
      }

      // Check if date range is too far in the future
      const today = new Date()
      if (fromDate > today) {
        const confirmFuture = window.confirm('Warning: Your "Date From" is in the future. This may result in no data. Continue anyway?')
        if (!confirmFuture) return false
      }
    }
    return true
  }

  const generateReport = () => {
    setGeneratingReport(true)
    try {
      console.log('Generating report with filters:', reportFilters)
      console.log('Available suppliers:', suppliers.length)
      console.log('Available orders:', orders.length)

      // Validate date filters first
      if (!validateDateFilters()) {
        setGeneratingReport(false)
        return
      }

      // Validate we have data
      if (suppliers.length === 0) {
        alert('No suppliers available. Please add suppliers first.')
        setGeneratingReport(false)
        return
      }

      if (orders.length === 0) {
        alert('No orders available. Please add orders first.')
        setGeneratingReport(false)
        return
      }

      const filteredSuppliers =
        reportFilters.supplierFilter === "all"
          ? suppliers
          : suppliers.filter((s) => s._id === reportFilters.supplierFilter)

      const filteredOrders = orders.filter((order) => {
        // Enhanced date parsing to handle different formats
        let orderDate
        try {
          // Handle different date formats that might be stored as strings
          if (order.orderDate) {
            // If it's already a valid date string, parse it
            orderDate = new Date(order.orderDate)

            // If the date is invalid, try parsing it as a different format
            if (isNaN(orderDate.getTime())) {
              // Try parsing as DD/MM/YYYY or MM/DD/YYYY
              const dateParts = order.orderDate.split(/[-/]/)
              if (dateParts.length === 3) {
                // Assume YYYY-MM-DD or DD/MM/YYYY format
                const year = dateParts.length === 3 && dateParts[0].length === 4 ? dateParts[0] : dateParts[2]
                const month = dateParts[1]
                const day = dateParts.length === 3 && dateParts[0].length === 4 ? dateParts[2] : dateParts[0]
                orderDate = new Date(year, month - 1, day) // month is 0-indexed
              }
            }
          } else {
            // If no order date, use creation date or current date
            orderDate = order.createdAt ? new Date(order.createdAt) : new Date()
          }
        } catch (error) {
          console.error('Error parsing order date:', order.orderDate, error)
          orderDate = order.createdAt ? new Date(order.createdAt) : new Date()
        }

        // Parse filter dates
        let fromDate, toDate
        try {
          fromDate = reportFilters.dateFrom ? new Date(reportFilters.dateFrom) : new Date("2000-01-01")
          toDate = reportFilters.dateTo ? new Date(reportFilters.dateTo) : new Date("2030-12-31")

          // Set toDate to end of day to include the entire day
          if (reportFilters.dateTo) {
            toDate.setHours(23, 59, 59, 999)
          }
        } catch (error) {
          console.error('Error parsing filter dates:', error)
          fromDate = new Date("2000-01-01")
          toDate = new Date("2030-12-31")
        }

        // Debug logging (can be removed in production)
        if (process.env.NODE_ENV === 'development') {
          console.log('Order date comparison:', {
            orderId: order._id,
            originalOrderDate: order.orderDate,
            parsedOrderDate: orderDate,
            fromDate: fromDate,
            toDate: toDate,
            isValidOrderDate: !isNaN(orderDate.getTime()),
            dateMatch: orderDate >= fromDate && orderDate <= toDate
          })
        }

        const dateMatch = !isNaN(orderDate.getTime()) && orderDate >= fromDate && orderDate <= toDate
        const statusMatch = reportFilters.statusFilter === "all" || order.status === reportFilters.statusFilter

        // Fix supplier matching - handle both object and string supplierId
        const orderSupplierId = typeof order.supplierId === 'object' ? order.supplierId._id : order.supplierId
        const supplierMatch =
          reportFilters.supplierFilter === "all" || orderSupplierId === reportFilters.supplierFilter

        return dateMatch && statusMatch && supplierMatch
      })

      console.log('Filtered suppliers:', filteredSuppliers.length)
      console.log('Filtered orders:', filteredOrders.length)

      // Provide detailed feedback about filtering results
      const totalOrdersBeforeFilter = orders.length
      const totalSuppliersBeforeFilter = suppliers.length

      console.log('Filtering summary:', {
        totalOrdersBefore: totalOrdersBeforeFilter,
        totalOrdersAfter: filteredOrders.length,
        totalSuppliersBefore: totalSuppliersBeforeFilter,
        totalSuppliersAfter: filteredSuppliers.length,
        dateRange: `${reportFilters.dateFrom || 'All time'} to ${reportFilters.dateTo || 'Present'}`,
        supplierFilter: reportFilters.supplierFilter,
        statusFilter: reportFilters.statusFilter
      })

      // Check if filters resulted in no data
      if (filteredOrders.length === 0) {
        let message = 'No orders match your current filters.'

        if (reportFilters.dateFrom || reportFilters.dateTo) {
          message += `\n\nDate range: ${reportFilters.dateFrom || 'All time'} to ${reportFilters.dateTo || 'Present'}`
          message += `\nTotal orders in system: ${totalOrdersBeforeFilter}`
        }

        if (reportFilters.statusFilter !== 'all') {
          message += `\nStatus filter: ${reportFilters.statusFilter}`
        }

        if (reportFilters.supplierFilter !== 'all') {
          const selectedSupplier = suppliers.find(s => s._id === reportFilters.supplierFilter)
          message += `\nSupplier filter: ${selectedSupplier?.name || 'Unknown'}`
        }

        message += '\n\nPlease adjust your filters and try again.'
        alert(message)
        setGeneratingReport(false)
        return
      }

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
${filteredSuppliers.length > 0
            ? filteredSuppliers
              .map((s) => {
                const supplierOrders = filteredOrders.filter((o) => {
                  const orderSupplierId = typeof o.supplierId === 'object' ? o.supplierId._id : o.supplierId
                  return orderSupplierId === s._id
                })
                const supplierValue = supplierOrders.reduce((sum, order) => sum + order.total, 0)
                return `${s.name}:
  - Status: ${s.status.toUpperCase()}
  - Contact: ${s.contact} (${s.email})
  - Orders in Period: ${supplierOrders.length}
  - Total Value: $${supplierValue.toFixed(2)}
  - Average Order: $${supplierOrders.length > 0 ? (supplierValue / supplierOrders.length).toFixed(2) : "0.00"}`
              })
              .join("\n\n")
            : "No suppliers found matching the current filters."}

=== ORDER ANALYSIS ===
Orders by Status:
- Pending: ${reportData.pendingOrders} (${reportData.totalOrders > 0 ? ((reportData.pendingOrders / reportData.totalOrders) * 100).toFixed(1) : 0}%)
- Active: ${filteredOrders.filter((o) => o.status === "active").length} (${reportData.totalOrders > 0 ? ((filteredOrders.filter((o) => o.status === "active").length / reportData.totalOrders) * 100).toFixed(1) : 0}%)
- Completed: ${reportData.completedOrders} (${reportData.totalOrders > 0 ? ((reportData.completedOrders / reportData.totalOrders) * 100).toFixed(1) : 0}%)

Recent Orders:
${filteredOrders.length > 0
            ? filteredOrders
              .slice(-10)
              .map((o) => `- Order #${o._id}: ${o.supplierName} - $${o.total.toFixed(2)} (${o.status}) - ${o.orderDate}`)
              .join("\n")
            : "No orders found in the selected period."}`
      } else if (reportFilters.reportType === "detailed") {
        content = `DETAILED SUPPLIER MANAGEMENT REPORT
Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Report Period: ${reportFilters.dateFrom || "All time"} to ${reportFilters.dateTo || "Present"}

=== DETAILED SUPPLIER INFORMATION ===
${filteredSuppliers
            .map((s) => {
              const supplierOrders = filteredOrders.filter((o) => {
                const orderSupplierId = typeof o.supplierId === 'object' ? o.supplierId._id : o.supplierId
                return orderSupplierId === s._id
              })
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
                    (o) => `  - Order #${o._id}: ${o.orderDate} | $${o.total.toFixed(2)} | ${o.status.toUpperCase()}
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
ORDER #${o._id}
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

Highest Value Order: $${filteredOrders.length > 0 ? Math.max(...filteredOrders.map((o) => o.total)).toFixed(2) : "0.00"}
Lowest Value Order: $${filteredOrders.length > 0 ? Math.min(...filteredOrders.map((o) => o.total)).toFixed(2) : "0.00"}

=== MONTHLY BREAKDOWN ===
${Object.keys(monthlyData).length > 0
            ? Object.entries(monthlyData)
              .sort()
              .map(
                ([month, data]) =>
                  `${month}: ${data.orders} orders, $${data.value.toFixed(2)} total, $${(data.value / data.orders).toFixed(2)} average`,
              )
              .join("\n")
            : "No order data available for monthly breakdown."}

=== SUPPLIER FINANCIAL PERFORMANCE ===
${filteredSuppliers
            .map((s) => {
              const supplierOrders = filteredOrders.filter((o) => {
                const orderSupplierId = typeof o.supplierId === 'object' ? o.supplierId._id : o.supplierId
                return orderSupplierId === s._id
              })
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
              (o) => `Order ID: ${o._id}
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
      setGeneratingReport(false)

      // Show success message with filtering results
      const filterMessage = `Report generated successfully!\n\nFiltered Results:\n- ${filteredOrders.length} orders (from ${totalOrdersBeforeFilter} total)\n- ${filteredSuppliers.length} suppliers (from ${totalSuppliersBeforeFilter} total)`

      if (reportFilters.dateFrom || reportFilters.dateTo) {
        console.log(filterMessage)
      }

      console.log('Report generated successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report. Please try again.')
      setGeneratingReport(false)
    }
  }

  // Enhanced download functions with headers and footers
  const downloadReportAsTXT = () => {
    if (!reportContent) {
      alert('Please generate a report first before downloading.')
      return
    }

    const header = `
╔════════════════════════════════════════════════════════════════════════════════╗
║                            KLASSY T SHIRTS                                     ║
║                        SUPPLIER MANAGEMENT SYSTEM                              ║
║                             BUSINESS REPORT                                    ║
╚════════════════════════════════════════════════════════════════════════════════╝

Report Type: ${reportFilters.reportType.toUpperCase()}
Generated On: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
Generated By: System Administrator
Report Period: ${reportFilters.dateFrom || "All time"} to ${reportFilters.dateTo || "Present"}
Filters Applied:
- Supplier: ${reportFilters.supplierFilter === "all" ? "All Suppliers" : suppliers.find(s => s._id === reportFilters.supplierFilter)?.name || "Unknown"}
- Status: ${reportFilters.statusFilter === "all" ? "All Statuses" : reportFilters.statusFilter}

${"=".repeat(80)}
`

    const footer = `
${"=".repeat(80)}

REPORT SUMMARY:
- Total Data Points Analyzed: ${suppliers.length + orders.length}
- Report Generation Time: ${new Date().toISOString()}
- System Version: v1.0.0

DISCLAIMER:
This report contains confidential business information of Klassy T Shirts.
Distribution of this report should be limited to authorized personnel only.

For questions about this report, contact: admin@klassytshirts.com

╔════════════════════════════════════════════════════════════════════════════════╗
║                     © 2025 Klassy T Shirts - All Rights Reserved              ║
║                          End of Report Document                                ║
╚════════════════════════════════════════════════════════════════════════════════╝
`

    const fullContent = header + reportContent + footer
    const blob = new Blob([fullContent], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Klassy-T-Shirts-${reportFilters.reportType}-Report-${new Date().toISOString().split("T")[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadReportAsCSV = () => {
    const csvData = []
    const currentDate = new Date()
    const reportId = `RPT-${currentDate.getTime()}`

    // Professional CSV Header with proper structure
    csvData.push(["═══════════════════════════════════════════════════════════════════════════"])
    csvData.push(["KLASSY T SHIRTS - SUPPLIER MANAGEMENT SYSTEM"])
    csvData.push(["BUSINESS INTELLIGENCE REPORT"])
    csvData.push(["═══════════════════════════════════════════════════════════════════════════"])
    csvData.push([""])

    // Report Metadata Section
    csvData.push(["REPORT INFORMATION"])
    csvData.push(["Field", "Value"])
    csvData.push(["Report Type", reportFilters.reportType.toUpperCase()])
    csvData.push(["Generated Date", currentDate.toLocaleDateString()])
    csvData.push(["Generated Time", currentDate.toLocaleTimeString()])
    csvData.push(["Report Period From", reportFilters.dateFrom || "All time"])
    csvData.push(["Report Period To", reportFilters.dateTo || "Present"])
    csvData.push(["Supplier Filter", reportFilters.supplierFilter === "all" ? "All Suppliers" : suppliers.find(s => s._id === reportFilters.supplierFilter)?.name || "Unknown"])
    csvData.push(["Status Filter", reportFilters.statusFilter === "all" ? "All Statuses" : reportFilters.statusFilter])
    csvData.push(["Report ID", reportId])
    csvData.push([""])

    // Apply filters to get the actual data being reported
    const filteredSuppliers = reportFilters.supplierFilter === "all"
      ? suppliers
      : suppliers.filter((s) => s._id === reportFilters.supplierFilter)

    const filteredOrders = orders.filter((order) => {
      // Enhanced date parsing to handle different formats (same as main filter)
      let orderDate
      try {
        if (order.orderDate) {
          orderDate = new Date(order.orderDate)

          if (isNaN(orderDate.getTime())) {
            const dateParts = order.orderDate.split(/[-/]/)
            if (dateParts.length === 3) {
              const year = dateParts.length === 3 && dateParts[0].length === 4 ? dateParts[0] : dateParts[2]
              const month = dateParts[1]
              const day = dateParts.length === 3 && dateParts[0].length === 4 ? dateParts[2] : dateParts[0]
              orderDate = new Date(year, month - 1, day)
            }
          }
        } else {
          orderDate = order.createdAt ? new Date(order.createdAt) : new Date()
        }
      } catch (error) {
        console.error('Error parsing order date for CSV:', order.orderDate, error)
        orderDate = order.createdAt ? new Date(order.createdAt) : new Date()
      }

      let fromDate, toDate
      try {
        fromDate = reportFilters.dateFrom ? new Date(reportFilters.dateFrom) : new Date("2000-01-01")
        toDate = reportFilters.dateTo ? new Date(reportFilters.dateTo) : new Date("2030-12-31")

        if (reportFilters.dateTo) {
          toDate.setHours(23, 59, 59, 999)
        }
      } catch (error) {
        console.error('Error parsing filter dates for CSV:', error)
        fromDate = new Date("2000-01-01")
        toDate = new Date("2030-12-31")
      }

      const dateMatch = !isNaN(orderDate.getTime()) && orderDate >= fromDate && orderDate <= toDate
      const statusMatch = reportFilters.statusFilter === "all" || order.status === reportFilters.statusFilter
      const orderSupplierId = typeof order.supplierId === 'object' ? order.supplierId._id : order.supplierId
      const supplierMatch = reportFilters.supplierFilter === "all" || orderSupplierId === reportFilters.supplierFilter
      return dateMatch && statusMatch && supplierMatch
    })

    // Executive Summary Section
    csvData.push(["EXECUTIVE SUMMARY"])
    csvData.push(["Metric", "Value", "Percentage", "Notes"])
    csvData.push(["Total Suppliers", filteredSuppliers.length, "100%", "Based on current filters"])
    csvData.push(["Active Suppliers", filteredSuppliers.filter(s => s.status === "active").length,
      `${filteredSuppliers.length > 0 ? ((filteredSuppliers.filter(s => s.status === "active").length / filteredSuppliers.length) * 100).toFixed(1) : 0}%`,
      "Currently active suppliers"])
    csvData.push(["Total Orders", filteredOrders.length, "100%", "Orders in selected period"])
    csvData.push(["Pending Orders", filteredOrders.filter(o => o.status === "pending").length,
      `${filteredOrders.length > 0 ? ((filteredOrders.filter(o => o.status === "pending").length / filteredOrders.length) * 100).toFixed(1) : 0}%`,
      "Awaiting processing"])
    csvData.push(["Completed Orders", filteredOrders.filter(o => o.status === "completed").length,
      `${filteredOrders.length > 0 ? ((filteredOrders.filter(o => o.status === "completed").length / filteredOrders.length) * 100).toFixed(1) : 0}%`,
      "Successfully completed"])
    csvData.push(["Total Order Value", `$${filteredOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}`, "-", "Sum of all orders"])
    csvData.push(["Average Order Value", `$${filteredOrders.length > 0 ? (filteredOrders.reduce((sum, o) => sum + o.total, 0) / filteredOrders.length).toFixed(2) : "0.00"}`, "-", "Mean order value"])
    csvData.push([""])

    if (reportFilters.reportType === "suppliers" || reportFilters.reportType === "detailed") {
      // Detailed Supplier Information
      csvData.push(["SUPPLIER DETAILS"])
      csvData.push(["Supplier Name", "Contact Person", "Email", "Phone", "Status", "Total Orders", "Last Order Date", "Registration Number"])
      filteredSuppliers.forEach((s) => {
        csvData.push([
          s.name,
          s.contact,
          s.email,
          s.phone,
          s.status.toUpperCase(),
          s.totalOrders || 0,
          s.lastOrder || "N/A",
          s.companyDetails?.registrationNumber || "N/A"
        ])
      })
      csvData.push([""])
    }

    if (reportFilters.reportType === "orders" || reportFilters.reportType === "detailed") {
      // Detailed Order Information
      csvData.push(["ORDER DETAILS"])
      csvData.push(["Order ID", "Supplier Name", "Order Date", "Delivery Date", "Status", "Total Amount", "Items", "Days to Delivery"])
      filteredOrders.forEach((o) => {
        const orderDate = new Date(o.orderDate)
        const deliveryDate = new Date(o.deliveryDate)
        const daysDiff = Math.ceil((deliveryDate - orderDate) / (1000 * 60 * 60 * 24))
        csvData.push([
          o._id,
          o.supplierName,
          o.orderDate,
          o.deliveryDate,
          o.status.toUpperCase(),
          `$${o.total.toFixed(2)}`,
          o.items || "N/A",
          `${daysDiff} days`
        ])
      })
      csvData.push([""])
    }

    if (reportFilters.reportType === "financial") {
      // Financial Analysis
      csvData.push(["FINANCIAL ANALYSIS"])
      csvData.push(["Analysis Type", "Value", "Details"])
      csvData.push(["Highest Order Value", `$${filteredOrders.length > 0 ? Math.max(...filteredOrders.map(o => o.total)).toFixed(2) : "0.00"}`, "Single largest order"])
      csvData.push(["Lowest Order Value", `$${filteredOrders.length > 0 ? Math.min(...filteredOrders.map(o => o.total)).toFixed(2) : "0.00"}`, "Single smallest order"])

      // Monthly breakdown
      const monthlyData = {}
      filteredOrders.forEach((order) => {
        const month = order.orderDate.substring(0, 7)
        if (!monthlyData[month]) {
          monthlyData[month] = { orders: 0, value: 0 }
        }
        monthlyData[month].orders++
        monthlyData[month].value += order.total
      })

      csvData.push([""])
      csvData.push(["MONTHLY BREAKDOWN"])
      csvData.push(["Month", "Number of Orders", "Total Value", "Average Order Value"])
      Object.entries(monthlyData)
        .sort()
        .forEach(([month, data]) => {
          csvData.push([
            month,
            data.orders,
            `$${data.value.toFixed(2)}`,
            `$${(data.value / data.orders).toFixed(2)}`
          ])
        })
      csvData.push([""])
    }

    // Supplier Performance Analysis
    if (filteredSuppliers.length > 0) {
      csvData.push(["SUPPLIER PERFORMANCE"])
      csvData.push(["Supplier Name", "Orders in Period", "Total Value", "Average Order", "Performance Rating"])
      filteredSuppliers.forEach((s) => {
        const supplierOrders = filteredOrders.filter((o) => {
          const orderSupplierId = typeof o.supplierId === 'object' ? o.supplierId._id : o.supplierId
          return orderSupplierId === s._id
        })
        const supplierValue = supplierOrders.reduce((sum, order) => sum + order.total, 0)
        const avgOrder = supplierOrders.length > 0 ? supplierValue / supplierOrders.length : 0
        let rating = "New"
        if (supplierOrders.length > 10) rating = "Excellent"
        else if (supplierOrders.length > 5) rating = "Good"
        else if (supplierOrders.length > 0) rating = "Active"

        csvData.push([
          s.name,
          supplierOrders.length,
          `$${supplierValue.toFixed(2)}`,
          `$${avgOrder.toFixed(2)}`,
          rating
        ])
      })
      csvData.push([""])
    }

    // Report Footer
    csvData.push(["═══════════════════════════════════════════════════════════════════════════"])
    csvData.push(["REPORT FOOTER & METADATA"])
    csvData.push(["═══════════════════════════════════════════════════════════════════════════"])
    csvData.push(["Generated By", "Klassy T Shirts Management System v1.0.0"])
    csvData.push(["Generation Timestamp", currentDate.toISOString()])
    csvData.push(["Total Data Points", `${filteredSuppliers.length + filteredOrders.length} records analyzed`])
    csvData.push(["Data Integrity", "Verified and validated"])
    csvData.push(["Contact Information", "admin@klassytshirts.com"])
    csvData.push([""])
    csvData.push(["LEGAL DISCLAIMER"])
    csvData.push(["Confidentiality", "This report contains confidential business information"])
    csvData.push(["Distribution", "Authorized personnel only"])
    csvData.push(["Copyright", "© 2025 Klassy T Shirts - All Rights Reserved"])
    csvData.push(["Report ID", reportId])

    const csvContent = csvData.map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Klassy-T-Shirts-${reportFilters.reportType}-Professional-Report-${currentDate.toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadReportAsHTML = () => {
    if (!reportContent) {
      alert('Please generate a report first before downloading.')
      return
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Klassy T Shirts - ${reportFilters.reportType.toUpperCase()} Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1e40af;
            margin: 0;
            font-size: 2.5em;
        }
        .header h2 {
            color: #64748b;
            margin: 5px 0;
            font-weight: normal;
        }
        .report-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #2563eb;
        }
        .report-content {
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 0.9em;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>KLASSY T SHIRTS</h1>
            <h2>Supplier Management System</h2>
            <h3>${reportFilters.reportType.toUpperCase()} REPORT</h3>
        </div>
        
        <div class="report-info">
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p><strong>Report Period:</strong> ${reportFilters.dateFrom || "All time"} to ${reportFilters.dateTo || "Present"}</p>
            <p><strong>Filters Applied:</strong></p>
            <ul>
                <li>Supplier: ${reportFilters.supplierFilter === "all" ? "All Suppliers" : suppliers.find(s => s._id === reportFilters.supplierFilter)?.name || "Unknown"}</li>
                <li>Status: ${reportFilters.statusFilter === "all" ? "All Statuses" : reportFilters.statusFilter}</li>
            </ul>
        </div>
        
        <div class="report-content">${reportContent}</div>
        
        <div class="footer">
            <p><strong>Report Summary:</strong></p>
            <p>Total Data Points Analyzed: ${suppliers.length + orders.length} | Generated: ${new Date().toISOString()}</p>
            <p><strong>Disclaimer:</strong> This report contains confidential business information.</p>
            <p>© 2025 Klassy T Shirts - All Rights Reserved</p>
        </div>
    </div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Klassy-T-Shirts-${reportFilters.reportType}-Report-${new Date().toISOString().split("T")[0]}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateCSVReport = downloadReportAsCSV // Keep backward compatibility



  if (loading) {
    return (
      <div className="supplier-container">
        <div className="dashboard-header">
          <h1>Supplier Management System</h1>
          <h3>Loading...</h3>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="supplier-container">
        <div className="dashboard-header">
          <h1>Supplier Management System</h1>
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
        <h1>Supplier Management System</h1>

        {successMessage && (
          <div style={{
            backgroundColor: '#0b0b0bff',
            color: '#121312ff',
            padding: '10px',
            borderRadius: '5px',
            marginTop: '10px',
            border: '1px solid #080908ff'
          }}>
            {successMessage}
          </div>
        )}
        {error && (
          <div style={{
            backgroundColor: '#121212ff',
            color: '#0a0a0aff',
            padding: '10px',
            borderRadius: '5px',
            marginTop: '10px',
            border: '1px solid #0c0c0cff'
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
                backgroundColor: '#0e0d0dff',
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
      <div className="supplier-container">


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
                    <tr key={supplier._id}>
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
              <button className="supbtn" onClick={() => openModal("supplier")}>
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
                  <th>Reg. Number</th>
                  <th>Status</th>
                  <th>Total Orders</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td>{supplier.name}</td>
                    <td>{supplier.contact}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.phone}</td>
                    <td>{supplier.companyDetails?.registrationNumber || "N/A"}</td>
                    <td>
                      <span className={`status-badge status-${supplier.status}`}>{supplier.status}</span>
                    </td>
                    <td>{supplier.totalOrders}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => openModal("supplier", supplier)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-destructive btn-small"
                          onClick={() => handleDelete("supplier", supplier._id)}
                        >
                          Delete
                        </button>
                      </div>
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
              <button className="supbtn" onClick={() => openModal("order")}>
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
                  <tr key={order._id}>
                    <td>#{order._id}</td>
                    <td>{order.supplierName}</td>
                    <td>{order.orderDate}</td>
                    <td>{order.deliveryDate}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>{order.status}</span>
                    </td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => openModal("order", order)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-destructive btn-small"
                          onClick={() => handleDelete("order", order._id)}
                        >
                          Delete
                        </button>
                      </div>
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
                        <option key={s._id} value={s._id}>
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
                <button className="supbtn" onClick={generateReport} disabled={generatingReport}>
                  {generatingReport ? "Generating..." : "View Report"}
                </button>
                {viewingReport && (
                  <>
                    <button
                      className="supbtn"
                      onClick={downloadReportAsTXT}
                      style={{ marginLeft: "10px" }}
                      title="Download complete report with headers and footers"
                    >
                      📄 Download TXT
                    </button>
                    <button
                      className="supbtn"
                      onClick={downloadReportAsCSV}
                      style={{ marginLeft: "10px" }}
                      title="Download data in CSV format with headers"
                    >
                      📊 Download CSV
                    </button>
                    <button
                      className="supbtn"
                      onClick={downloadReportAsHTML}
                      style={{ marginLeft: "10px" }}
                      title="Download formatted HTML report for web viewing"
                    >
                      🌐 Download HTML
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setViewingReport(false)}
                      style={{ marginLeft: "10px" }}
                    >
                      Hide Report
                    </button>
                  </>
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
                      <label className="form-label">Registration Number</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.companyDetails?.registrationNumber || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          companyDetails: {
                            ...formData.companyDetails,
                            registrationNumber: e.target.value
                          }
                        })}
                        placeholder="Enter registration number (optional)"
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
                          const supplier = suppliers.find((s) => s._id === e.target.value)
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
                            <option key={supplier._id} value={supplier._id}>
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
                      <label className="form-label">Order Items</label>
                      {orderItems.map((item, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          gap: '10px',
                          marginBottom: '10px',
                          alignItems: 'center',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          backgroundColor: 'var(--muted)'
                        }}>
                          <div style={{ flex: 2 }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) => updateOrderItem(index, 'name', e.target.value)}
                              style={{ margin: 0 }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="Qty"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              style={{ margin: 0 }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="Unit Price"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateOrderItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              style={{ margin: 0 }}
                            />
                          </div>
                          <div style={{ flex: 0 }}>
                            {orderItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOrderItem(index)}
                                style={{
                                  background: 'var(--destructive)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '8px 12px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem'
                                }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOrderItem}
                        style={{
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 16px',
                          cursor: 'pointer',
                          marginTop: '10px'
                        }}
                      >
                        + Add Item
                      </button>
                      <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: 'var(--muted)',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.9rem'
                      }}>
                        <strong>Calculated Total: ${calculateTotalFromItems(orderItems).toFixed(2)}</strong>
                      </div>
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
      <div >
        <Footer></Footer>
      </div>
    </div>

  )
}
