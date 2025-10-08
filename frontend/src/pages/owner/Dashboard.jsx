import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { assets } from '../../assets/assets'
import './Dashboard.css'

const Dashboard = () => {

  const currency = process.env.REACT_APP_CURRENCY

  console.log("Dashboard component is rendering"); // Check if this log shows up

  const [data,setData] = useState({
    totalOutfits: 0,
    totalBookings:0,
    pendingBookings:0,
    completedBookings:0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  const dashboardCards = [
    {title: "Total Outfits", value: data.totalOutfits, icon : assets.shirtIconColored},
    {title: "Total Bookings", value: data.totalBookings, icon : assets.listIconColored},
    {title: "Pending", value: data.pendingBookings, icon : assets.cautionIconColored},
    {title: "Confirmed", value: data.completedBookings, icon : assets.listIconColored}
  ]

  const fetchDashboard = async ()=>{
    try{
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'
      const { data: resp } = await axios.get(`${BASE_URL}/api/owner/dashboard`)
      if(resp?.success && resp.dashboardData){
        const { totalOutfits, totalBookings, pendingBookings, confirmedBookings, cancelledBookings, monthlyRevenue } = resp.dashboardData
        setData({
          totalOutfits,
          totalBookings,
          pendingBookings: pendingBookings?.length || 0,
          completedBookings: confirmedBookings || 0,
          recentBookings: pendingBookings || [],
          monthlyRevenue
        })
      }
    }catch(err){ console.error(err) }
  }

  useEffect(()=>{
    fetchDashboard()
  }, [])


  return (
    <div className='owner-dashboard-page'>
      <div className='owner-dashboard'>
        {/* Header Section */}
        <header className='dashboard__header'>
          <div className='dashboard__header-content'>
            <h1>Owner Dashboard</h1>
            <p>Monitor overall platform performance including total outfits, bookings, revenue, and recent activities</p>
          </div>
          <button 
            onClick={fetchDashboard}
            className='dashboard__refresh-btn'
          >
            <i className='bx bx-refresh'></i> Refresh Data
          </button>
        </header>

        {/* Stats Grid */}
        <section className='dashboard__stats-grid'>
          {dashboardCards.map((card, index) => (
            <div key={index} className='stat-card'>
              <div className='stat-card__header'>
                <div className='stat-card__info'>
                  <h3>{card.title}</h3>
                  <p>{card.value}</p>
                </div>
                <div className='stat-card__icon'>
                  <img src={card.icon} alt={card.title} />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Main Content Grid */}
        <section className='dashboard__content-grid'>
          {/* Recent Bookings */}
          <div className='info-card'>
            <div className='info-card__header'>
              <h2>Recent Bookings</h2>
              <p>Latest customer bookings and their status</p>
            </div>
            {data.recentBookings.length > 0 ? (
              data.recentBookings.map((booking, index) => (
                <div key={index} className='booking-item'>
                  <div className='booking-item__left'>
                    <div className='booking-item__icon'>
                      <img src={assets.listIconColored} alt="Booking" />
                    </div>
                    <div className='booking-item__details'>
                      <h4>{booking.outfit.brand} {booking.outfit.model}</h4>
                      <p>{new Date(booking.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                  <div className='booking-item__right'>
                    <span className='booking-item__price'>{currency} {booking.price}</span>
                    <span className='booking-item__status'>{booking.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className='empty-state'>
                <i className='bx bx-calendar-x'></i>
                <p>No recent bookings available</p>
              </div>
            )}
          </div>

          {/* Monthly Revenue */}
          <div className='info-card revenue-card'>
            <div className='info-card__header'>
              <h2>Monthly Revenue</h2>
              <p>Total revenue for the current month</p>
            </div>
            <div className='revenue-card__amount'>
              {currency} {data.monthlyRevenue.toLocaleString()}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard