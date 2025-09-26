import React, { useState } from 'react'
import { assets, menuLinks } from '../../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'
import { useAuth } from '../../AuthGuard/AuthGuard'

const Navbar = () => {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const { isAuthenticated, currentUser, logout } = useAuth()

  const triggerCategorySearch = () => {
    const term = searchTerm.trim()
    if (!term) return
    // Navigate to Outfits page with category query param
    navigate(`/Outfits?category=${encodeURIComponent(term)}`)
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerCategorySearch()
    }
  }

  return (
    <nav className="navbar">
      {/* Logo */}
      <h2 className="logo" onClick={() => navigate('/') }>
        Klassy T Shirts
      </h2>

      {/* Mobile toggle */}
      <div
        className="menu-icon"
        onClick={() => setOpen(!open)}
      >
        <i className={open ? 'bx bx-x' : 'bx bx-menu'}></i>
      </div>

      <div className={`nav-content ${open ? 'active' : ''}`}>
        {/* Menu Links */}
        <div className="nav-links">
          {menuLinks.map((link, index) => {
            const highlight =
              link.name === 'Home' ||
              link.name === 'Outfit' ||
              link.name === 'My Bookings'

            return (
              <Link
  key={index}
  to={link.name === 'Home' ? '/rentalHome' : link.path}
  onClick={() => setOpen(false)}
>
  <button className={highlight ? 'nav-btn special-btn' : 'nav-btn'}>
    {link.name}
  </button>
</Link>
            )
          })}
        </div>

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            placeholder="Search by category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <img
            src={assets.search_icon}
            alt="search"
            onClick={triggerCategorySearch}
            style={{ cursor: 'pointer' }}
          />
        </div>

        {/* Buttons */}
        <div className="navbar-buttons">
          {isAuthenticated() ? (
            <>
              {(currentUser?.type === 'owner' || currentUser?.type === 'Admin') && (
                <button onClick={() => navigate('/owner')}>Dashboard</button>
              )}
              <button onClick={() => { logout(); navigate('/rentalHome'); }}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/owner')}>Dashboard</button>
              <button onClick={() => navigate('/login')}>Login</button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
