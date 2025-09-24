import React, { useState } from 'react';
import { assets, dummyUserData } from '../../../assets/assets';
import { Link } from 'react-router-dom';
import './navBarOwner.css'; // ✅ CSS file

const NavbarOwner = () => {
  const user = dummyUserData;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar-owner">
      {/* Logo → Main Home */}
      <Link to="/" className="owner-logo">
        <img src={assets.logo} alt="Klassy T-Shirt Logo" className="h-8" />
      </Link>

      {/* Welcome text (hidden on small screens) */}
      <p className="welcome-text">
        Welcome, {user.name || 'Owner'}
      </p>

      {/* Hamburger menu (mobile only) */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <i className={menuOpen ? 'bx bx-x' : 'bx bx-menu'}></i>
      </div>

      {/* Right-side nav buttons */}
      <div className={`nav-buttons ${menuOpen ? 'active' : ''}`}>
        <Link to="/rentalHome" onClick={() => setMenuOpen(false)}>
          <button className="nav-btn special-btn">Home</button>
        </Link>
      </div>
    </nav>
  );
};

export default NavbarOwner;
