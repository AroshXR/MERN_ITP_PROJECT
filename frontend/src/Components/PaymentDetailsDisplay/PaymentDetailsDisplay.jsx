"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./PaymentDetailsDisplay.css"
import Footer from "../Footer/Footer"
import NavBar from "../NavBar/navBar"
import { useNavigate } from "react-router-dom"

const PaymentDetailsDisplay = () => {
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const itemsPerPage = 10

  // Fetch payment details from backend
  const fetchPayments = async (page = 1, status = "", search = "") => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      })

      if (status) params.append('status', status)

      const response = await axios.get(`http://localhost:5001/payment?${params}`)

      if (response.data.status === 'ok') {
        setPayments(response.data.data)
        setTotalPages(response.data.pagination.totalPages)
        setTotalItems(response.data.pagination.totalItems)
        setCurrentPage(response.data.pagination.currentPage)
      } else {
        setError(response.data.message || 'Failed to fetch payment details')
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
      setError('Failed to fetch payment details: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  // Fetch payment statistics
  const [statistics, setStatistics] = useState(null)
  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:5001/payment/statistics')
      if (response.data.status === 'ok') {
        setStatistics(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchPayments()
    fetchStatistics()
  }, [])

  // Handle filter changes
  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus)
    setCurrentPage(1)
    fetchPayments(1, newStatus, searchTerm)
  }

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPayments(1, statusFilter, searchTerm)
  }

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    fetchPayments(newPage, statusFilter, searchTerm)
  }

  // View payment details
  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment)
    setShowModal(true)
  }

  // Update payment status
  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      const response = await axios.patch(`http://localhost:5001/payment/${paymentId}/status`, {
        status: newStatus
      })

      if (response.data.status === 'ok') {
        // Refresh the payments list
        fetchPayments(currentPage, statusFilter, searchTerm)
        setShowModal(false)
        alert('Payment status updated successfully!')
      } else {
        alert('Failed to update payment status: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Error updating payment status: ' + (error.response?.data?.message || error.message))
    }
  }

  // Delete payment
  const deletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) {
      return
    }

    try {
      const response = await axios.delete(`http://localhost:5001/payment/${paymentId}`)

      if (response.data.status === 'ok') {
        // Refresh the payments list
        fetchPayments(currentPage, statusFilter, searchTerm)
        alert('Payment record deleted successfully!')
      } else {
        alert('Failed to delete payment: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error deleting payment:', error)
      alert('Error deleting payment: ' + (error.response?.data?.message || error.message))
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return 'status-completed'
      case 'processing': return 'status-processing'
      case 'pending': return 'status-pending'
      case 'cancelled': return 'status-cancelled'
      case 'failed': return 'status-failed'
      default: return 'status-default'
    }
  }

  return (
    <div>
      <NavBar />
      <div className="payment-header">
        <h1>Payment Details Management</h1>
        <p>View and manage all payment records from the database</p>
        
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
      </div>

      <div className="payment-details-container">



        {/* Statistics Cards */}
        {statistics && (
          <div className="statistics-cards">
            <div className="stat-card">
              <h3>Total Payments</h3>
              <p className="stat-number">{statistics.totalPayments}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-number">{formatCurrency(statistics.totalRevenue)}</p>
            </div>
            <div className="stat-card">
              <h3>Average Order</h3>
              <p className="stat-number">{formatCurrency(statistics.averageOrderValue)}</p>
            </div>
            <div className="stat-card">
              <h3>Status Distribution</h3>
              <div className="status-distribution">
                {Object.entries(statistics.statusDistribution).map(([status, count]) => (
                  <span key={status} className={`status-badge ${getStatusBadgeClass(status)}`}>
                    {status}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label>Status Filter:</label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-message">
            Loading payment details...
          </div>
        )}

        {/* Payments Table */}
        {!loading && !error && (
          <div className="payments-table-container">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Total Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="payment-id">{payment._id.slice(-8)}</td>
                    <td>{payment.deliveryDetails.firstName} {payment.deliveryDetails.lastName}</td>
                    <td>{payment.deliveryDetails.email}</td>
                    <td className="amount">{formatCurrency(payment.orderDetails.total)}</td>
                    <td className="payment-method">
                      <span className={`method-badge method-${payment.paymentDetails.method}`}>
                        {payment.paymentDetails.method.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td className="actions">
                      <button
                        className="btn-view"
                        onClick={() => viewPaymentDetails(payment)}
                      >
                        View
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deletePayment(payment._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {payments.length === 0 && (
              <div className="no-data">
                No payment records found.
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="page-info">
              Page {currentPage} of {totalPages} ({totalItems} total records)
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Payment Details Modal */}
        {showModal && selectedPayment && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Payment Details</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>

              <div className="modal-body">
                <div className="details-section">
                  <h3>Customer Information</h3>
                  <div className="details-grid">
                    <div><strong>Name:</strong> {selectedPayment.deliveryDetails.firstName} {selectedPayment.deliveryDetails.lastName}</div>
                    <div><strong>Email:</strong> {selectedPayment.deliveryDetails.email}</div>
                    <div><strong>Phone:</strong> {selectedPayment.deliveryDetails.phone}</div>
                    <div><strong>Address:</strong> {selectedPayment.deliveryDetails.address}</div>
                    <div><strong>City:</strong> {selectedPayment.deliveryDetails.city}</div>
                    <div><strong>State:</strong> {selectedPayment.deliveryDetails.state}</div>
                    <div><strong>ZIP Code:</strong> {selectedPayment.deliveryDetails.zipCode}</div>
                    <div><strong>Country:</strong> {selectedPayment.deliveryDetails.country}</div>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Order Information</h3>
                  <div className="details-grid">
                    <div><strong>Subtotal:</strong> {formatCurrency(selectedPayment.orderDetails.subtotal)}</div>
                    <div><strong>Tax:</strong> {formatCurrency(selectedPayment.orderDetails.tax)}</div>
                    <div><strong>Shipping:</strong> {formatCurrency(selectedPayment.shippingDetails.cost)}</div>
                    {selectedPayment.orderDetails.giftWrap && (
                      <div><strong>Gift Wrap:</strong> {formatCurrency(selectedPayment.orderDetails.giftWrapFee)}</div>
                    )}
                    <div><strong>Total:</strong> {formatCurrency(selectedPayment.orderDetails.total)}</div>
                    <div><strong>Status:</strong>
                      <span className={`status-badge ${getStatusBadgeClass(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="details-section">
                  <h3>Payment Information</h3>
                  <div className="details-grid">
                    <div><strong>Method:</strong> {selectedPayment.paymentDetails.method.toUpperCase()}</div>
                    {selectedPayment.paymentDetails.method === 'card' && selectedPayment.paymentDetails.cardDetails && (
                      <>
                        <div><strong>Card Number:</strong> {selectedPayment.paymentDetails.cardDetails.cardNumber}</div>
                        <div><strong>Expiry:</strong> {selectedPayment.paymentDetails.cardDetails.expiryDate}</div>
                        <div><strong>Name on Card:</strong> {selectedPayment.paymentDetails.cardDetails.cardName}</div>
                        <div><strong>Save Card:</strong> {selectedPayment.paymentDetails.cardDetails.saveCard ? 'Yes' : 'No'}</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="details-section">
                  <h3>Shipping Information</h3>
                  <div className="details-grid">
                    <div><strong>Method:</strong> {selectedPayment.shippingDetails.method}</div>
                    <div><strong>Cost:</strong> {formatCurrency(selectedPayment.shippingDetails.cost)}</div>
                  </div>
                </div>

                {selectedPayment.giftMessage && (
                  <div className="details-section">
                    <h3>Gift Message</h3>
                    <p>{selectedPayment.giftMessage}</p>
                  </div>
                )}

                <div className="details-section">
                  <h3>Timestamps</h3>
                  <div className="details-grid">
                    <div><strong>Created:</strong> {formatDate(selectedPayment.createdAt)}</div>
                    <div><strong>Updated:</strong> {formatDate(selectedPayment.updatedAt)}</div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <div className="status-update">
                  <label>Update Status:</label>
                  <select
                    value={selectedPayment.status}
                    onChange={(e) => updatePaymentStatus(selectedPayment._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <button className="btn-close" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      <div>
        <Footer></Footer>
      </div>
    </div>

  )
}

export default PaymentDetailsDisplay
