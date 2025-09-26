import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../AuthGuard/AuthGuard'
import Navbar from '../Components/pasindu/Navbar'
import Footer from '../Components/Footer/Footer'

const EditBooking = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { getToken } = useAuth()

  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [formData, setFormData] = useState({
    reservationDate: '',
    returnDate: '',
    phone: '',
    email: ''
  })
  const [document, setDocument] = useState(null)
  const [currentDocument, setCurrentDocument] = useState('')

  // Fetch booking details on component mount
  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'
      const token = getToken()
      
      const { data } = await axios.get(`${BASE_URL}/api/booking/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (data?.success) {
        const bookingData = data.booking
        setBooking(bookingData)
        setFormData({
          reservationDate: bookingData.reservationDate.split('T')[0],
          returnDate: bookingData.returnDate.split('T')[0],
          phone: bookingData.phone,
          email: bookingData.email
        })
        setCurrentDocument(bookingData.document)
      } else {
        alert(data?.message || 'Failed to fetch booking details')
        navigate('/my-bookings')
      }
    } catch (err) {
      console.error(err)
      alert('Error fetching booking details')
      navigate('/my-bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'
      const token = getToken()
      
      const formDataToSend = new FormData()
      formDataToSend.append('reservationDate', formData.reservationDate)
      formDataToSend.append('returnDate', formData.returnDate)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('email', formData.email)
      
      if (document) {
        formDataToSend.append('document', document)
      }

      const { data } = await axios.put(`${BASE_URL}/api/booking/${bookingId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      if (data?.success) {
        alert('Booking updated successfully!')
        navigate('/my-bookings')
      } else {
        alert(data?.message || 'Failed to update booking')
      }
    } catch (err) {
      console.error(err)
      alert('Error updating booking')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading booking details...</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-500">Booking not found</div>
        </div>
        <Footer />
      </div>
    )
  }

  // Only allow editing pending bookings
  if (booking.status !== 'pending') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-lg mb-4">This booking cannot be edited</div>
            <div className="text-gray-600 mb-4">Only pending bookings can be modified</div>
            <button 
              onClick={() => navigate('/my-bookings')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Back to My Bookings
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Booking</h1>
            
            {/* Outfit Details */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Outfit Details</h2>
              <div className="flex gap-4">
                <img 
                  src={booking.outfit.image} 
                  alt={booking.outfit.brand}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-medium">{booking.outfit.brand} - {booking.outfit.model}</h3>
                  <p className="text-gray-600">{booking.outfit.category}</p>
                  <p className="text-green-600 font-medium">Rs. {booking.outfit.pricePerDay}/day</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reservation Date
                  </label>
                  <input
                    type="date"
                    name="reservationDate"
                    value={formData.reservationDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Date
                  </label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                    min={formData.reservationDate || new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identity Document (Optional - Upload new to replace current)
                </label>
                <input
                  type="file"
                  onChange={(e) => setDocument(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {currentDocument && !document && (
                  <p className="text-sm text-gray-600 mt-1">
                    Current document: {currentDocument.split('/').pop()}
                  </p>
                )}
              </div>

              {/* Price Display */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Estimated Total:</span>
                  <span className="text-xl font-bold text-blue-600">
                    Rs. {(() => {
                      if (formData.reservationDate && formData.returnDate) {
                        const days = Math.ceil((new Date(formData.returnDate) - new Date(formData.reservationDate)) / (1000 * 60 * 60 * 24))
                        return (booking.outfit.pricePerDay * days).toFixed(2)
                      }
                      return booking.price.toFixed(2)
                    })()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/my-bookings')}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                >
                  Update Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default EditBooking
