import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import Title from '../Components/pasindu/Title'
import Navbar from '../Components/pasindu/Navbar'
import axios from 'axios'
import { useAuth } from '../AuthGuard/AuthGuard'

const MyBookings = () => {

  const [bookings, setBookings] = useState([])  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const currency = process.env.REACT_APP_CURRENCY
  const { isAuthenticated, getToken } = useAuth()

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!isAuthenticated()) {
        console.log('User not authenticated');
        setError('Please log in to view your bookings');
        setLoading(false);
        return;
      }

      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
      const token = getToken();
      
      const { data } = await axios.get(`${BASE_URL}/api/booking/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (data?.success) {
        setBookings(data.bookings);
        console.log('Bookings fetched:', data.bookings);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Error loading bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyBookings()
  }, [])

  return (
    <div>
      <Navbar></Navbar>

    <div className='px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 text-sm max-w-8xl'> 
     
      <Title title='My Bookings' subTitle='View and manage your all bookings' align="left" />
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading your bookings...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No bookings found</p>
          <p className="text-gray-400">Book an outfit to see it here!</p>
        </div>
      )}
      
      <div>
        {bookings.map((booking, index) => (
          <div key={booking._id} className='grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-solid border-black rounded-lg mt-5 first:mt-12 bg-white'>
            
            {/* Outfit Image + Info */}
            <div className='md:col-span-1'>
              <div className='rounded-md overflow-hidden mb-3'>
                <img src={booking.outfit.image} alt="" className='w-60 h-60 aspect-video object-cover object-top'  />  {/* You can customize the image here */}
              </div>

              <p className='text-lg font-medium mt-2'>{booking.outfit.brand} {booking.outfit.model} </p>
              <p className='text-gray-500'>{booking.outfit.category} • {booking.outfit.location} </p>
            </div>

            {/* Booking Info */}
            <div className='md:col-span-2'>
              <div className='flex items-center gap-2'>
                <p className='px-3 py-1.5 bg-light rounded'>Booking #{index + 1} </p>
                <p className={`px-3 py-1 text-xs rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-400/15 text-green-600' : 
                  booking.status === 'pending' ? 'bg-yellow-400/15 text-yellow-600' : 
                  'bg-red-400/15 text-red-600'
                }`}>
                  {booking.status} 
                </p>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.calendar_icon_colored} alt="" className='w-4 h-4 mt-1' />
                <div>
                  <p className='text-gray-500'>Rental Period</p>
                  <p>{booking.reservationDate.split('T')[0]} To {booking.returnDate.split('T')[0]} </p>
                </div>
              </div>

              <div className='flex items-start gap-2 mt-3'>
                <img src={assets.location_icon} alt="" className='w-4 h-4 mt-1' />
                <div>
                  <p className='text-red-500'>Pickup Location</p>
                  <p>{booking.outfit.location} </p> 
                </div>
              </div>
            </div>

            {/* Price */}
            <div className='md:col-span-1 flex flex-col justify-between gap-6'>
              <div className='text-sm text-gray-500 text-right'>
                <p>Total Price</p>
                <h1 className='text-2xl font-semibold text-primary'>{currency}{booking.price}</h1>
                <p>Booked On {booking.createdAt.split('T')[0]} </p>
              </div>
            </div>

          </div>
        ))}

      </div>
    </div>
  </div>
  )
}

export default MyBookings
