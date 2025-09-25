import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../AuthGuard/AuthGuard'
import Title from '../../Components/pasindu/owner/Title'

const Reports = () => {
  const { getToken, currentUser } = useAuth()
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    location: 'all'
  })

  const fetchReport = async () => {
    try {
      setLoading(true)
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'
      const token = getToken()
      
      const params = new URLSearchParams()
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.location !== 'all') params.append('location', filters.location)

      const { data } = await axios.get(`${BASE_URL}/api/booking/admin/report?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data?.success) {
        setReportData(data.reportData)
      } else {
        alert(data?.message || 'Failed to generate report')
      }
    } catch (err) {
      console.error(err)
      alert('Error generating report')
    } finally {
      setLoading(false)
    }
  }

  const generateHTMLReport = () => {
    if (!reportData) return

    const { bookings, summary } = reportData
    const currency = process.env.REACT_APP_CURRENCY || 'Rs.'
    
    const htmlContent = `
    <!DOCTYPE html>
<html>
<head>
    <title>Booking Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .header h1 { color: #000; margin: 0; }
        .header p { margin: 5px 0; color: #333; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #ccc; }
        .summary h2 { color: #000; margin-top: 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
        .summary-item { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #000; border: 1px solid #ddd; }
        .summary-item h3 { margin: 0 0 5px 0; color: #000; }
        .summary-item p { margin: 0; font-size: 18px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #000; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ccc; }
        th { background: #000; color: white; font-weight: bold; }
        tr:nth-child(even) { background: #f9f9f9; }
        tr:nth-child(odd) { background: white; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid #000; }
        .status.pending { background: #e6e6e6; color: #000; }
        .status.confirmed { background: #d4d4d4; color: #000; }
        .status.cancelled { background: #b8b8b8; color: #000; }
        .outfit-info { display: flex; align-items: center; gap: 10px; }
        .outfit-img { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1> Booking Report</h1>
        <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Owner:</strong> ${currentUser?.username || 'Owner'}</p>
        <p><strong>Report Period:</strong> ${summary.reportPeriod.startDate} to ${summary.reportPeriod.endDate}</p>
    </div>

    <div class="summary">
        <h2> Summary & Analytics</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <h3>Total Bookings</h3>
                <p>${summary.totalBookings}</p>
            </div>
            <div class="summary-item">
                <h3>Total Revenue</h3>
                <p>${currency}${summary.totalRevenue.toFixed(2)}</p>
            </div>
            <div class="summary-item">
                <h3>Confirmed Bookings</h3>
                <p>${summary.statusCounts.confirmed || 0}</p>
            </div>
            <div class="summary-item">
                <h3>Pending Bookings</h3>
                <p>${summary.statusCounts.pending || 0}</p>
            </div>
        </div>
    </div>

    <h2>📋 Detailed Booking Information</h2>
    <table>
        <thead>
            <tr>
                <th>Booking ID</th>
                <th>Outfit Details</th>
                <th>Customer</th>
                <th>Booking Period</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Total Price</th>
            </tr>
        </thead>
        <tbody>
            ${bookings.map(booking => {
                const startDate = new Date(booking.reservationDate).toLocaleDateString()
                const endDate = new Date(booking.returnDate).toLocaleDateString()
                const duration = Math.ceil((new Date(booking.returnDate) - new Date(booking.reservationDate)) / (1000 * 60 * 60 * 24))
                
                return `
                <tr>
                    <td>#${booking._id.slice(-6)}</td>
                    <td>
                        <div class="outfit-info">
                            <img src="${booking.outfit?.image || ''}" alt="Outfit" class="outfit-img" onerror="this.style.display='none'">
                            <div>
                                <strong>${booking.outfit?.brand || 'N/A'} - ${booking.outfit?.model || 'N/A'}</strong><br>
                                <small>${booking.outfit?.category || 'N/A'} | ${booking.outfit?.location || 'N/A'}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <strong>${booking.user?.username || 'N/A'}</strong><br>
                        <small>${booking.user?.email || 'N/A'}</small>
                    </td>
                    <td>
                        <strong>Start:</strong> ${startDate}<br>
                        <strong>End:</strong> ${endDate}
                    </td>
                    <td>${duration} day${duration !== 1 ? 's' : ''}</td>
                    <td><span class="status ${booking.status}">${booking.status.toUpperCase()}</span></td>
                    <td><strong>${currency}${booking.price.toFixed(2)}</strong></td>
                </tr>
                `
            }).join('')}
        </tbody>
    </table>

    <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
        <p>This report was generated automatically by the Outfit Rental Management System</p>
        <p>© ${new Date().getFullYear()} - All rights reserved</p>
    </div>
</body>
</html>

    `

    const newWindow = window.open('', '_blank')
    newWindow.document.write(htmlContent)
    newWindow.document.close()
  }

  return (
    <div className='px-4 py-10 md:px-10 flex-1'>
      <div className="w-full h-full bg-gradient-to-br from-[#e6e5e5] to-[#858585] rounded-[50px] p-10 shadow-lg shadow-gray-400/30 relative overflow-hidden">
        
        <div className="text-center mb-8">
          <Title title=" Booking Reports" subTitle="Generate comprehensive booking reports with detailed analytics and insights for your rental business." />
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-6 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📅 Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📅 End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📋 Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📍 Location</label>
            <select
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
            >
              <option value="all">All Locations</option>
              <option value="Colombo">Colombo</option>
              <option value="Gampaha">Gampaha</option>
              <option value="Kadawatha">Kadawatha</option>
              <option value="Rajagiriya">Rajagiriya</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium disabled:opacity-50 shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            {loading ? '⏳ Generating...' : '🔍 Generate Report'}
          </button>
          
          {reportData && (
            <button
              onClick={generateHTMLReport}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg transition-all duration-300 hover:shadow-xl"
            >
              📄 View HTML Report
            </button>
          )}
        </div>

        {/* Report Preview */}
        {reportData && (
          <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
            <h2 className="text-xl font-bold mb-6 text-gray-800"> Report Preview</h2>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-500/20 backdrop-blur-sm p-4 rounded-xl border border-blue-300/30">
                <h3 className="text-blue-700 font-medium text-sm">Total Bookings</h3>
                <p className="text-2xl font-bold text-blue-800">{reportData.summary.totalBookings}</p>
              </div>
              <div className="bg-green-500/20 backdrop-blur-sm p-4 rounded-xl border border-green-300/30">
                <h3 className="text-green-700 font-medium text-sm">Total Revenue</h3>
                <p className="text-2xl font-bold text-green-800">Rs.{reportData.summary.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-yellow-500/20 backdrop-blur-sm p-4 rounded-xl border border-yellow-300/30">
                <h3 className="text-yellow-700 font-medium text-sm">Confirmed</h3>
                <p className="text-2xl font-bold text-yellow-800">{reportData.summary.statusCounts.confirmed || 0}</p>
              </div>
              <div className="bg-purple-500/20 backdrop-blur-sm p-4 rounded-xl border border-purple-300/30">
                <h3 className="text-purple-700 font-medium text-sm">Pending</h3>
                <p className="text-2xl font-bold text-purple-800">{reportData.summary.statusCounts.pending || 0}</p>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-800/80 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">Booking</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">Outfit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">Period</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.bookings.slice(0, 10).map((booking) => (
                      <tr key={booking._id} className="hover:bg-white/30">
                        <td className="px-4 py-4 text-sm font-mono">#{booking._id.slice(-6)}</td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <img src={booking.outfit?.image} alt="" className="w-8 h-8 object-cover rounded" />
                            <div>
                              <div className="font-medium">{booking.outfit?.brand} - {booking.outfit?.model}</div>
                              <div className="text-gray-600 text-xs">{booking.outfit?.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="font-medium">{booking.user?.username}</div>
                          <div className="text-gray-600 text-xs">{booking.user?.email}</div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div>{new Date(booking.reservationDate).toLocaleDateString()}</div>
                          <div className="text-gray-600 text-xs">to {new Date(booking.returnDate).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold">Rs.{booking.price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.bookings.length > 10 && (
                  <div className="text-center text-gray-600 py-4 bg-white/20">
                    Showing first 10 of {reportData.bookings.length} bookings. View full report for complete data.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Reports
