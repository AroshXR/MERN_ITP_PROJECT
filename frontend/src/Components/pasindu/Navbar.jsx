import React, { useState } from 'react'
import { assets, menuLinks } from '../../assets/assets'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Navbar.css'; // Import the custom CSS

const Navbar = ({ setShowLogin }) => {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className={`navbar-container ${location.pathname === "/" ? "bg-light" : "bg-white"}`}>
      <Link to='/'>
        <img
          src={assets.logo}
          alt="logo"
          style={{ height: '60px', width: 'auto', transform: 'translate(-20px, -10px)' }}
          className="h-8 flex-shrink-0"
        />
      </Link>

      <div className={`navbar-links-container ${open ? 'show' : ''}`}>
        {/* Menu Links */}
        {menuLinks.map((link, index) => (
          <Link key={index} to={link.path}>
            {link.name}
          </Link>
        ))}

        {/* Search Bar */}
        <div className="search-bar">
          <input
            type="text"
            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
            placeholder="Search Products"
          />
          <img src={assets.search_icon} alt="search" />
        </div>

        {/* Buttons */}
        <div className="navbar-buttons">
          <button onClick={() => navigate('/owner')}>Dashboard</button>
          <button onClick={() => setShowLogin(true)}>Login</button>
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-btn"
        aria-label="Menu"
        onClick={() => setOpen(!open)}
      >
        <img src={open ? assets.close_icon : assets.menu_icon} alt="menu" />
      </button>
    </div>
  )
}

export default Navbar
