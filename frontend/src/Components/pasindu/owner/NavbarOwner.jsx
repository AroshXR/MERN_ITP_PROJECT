import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './navBarOwner.css'; // reuse the same CSS

const NavbarOwner = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleLogoClick = () => {
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <h2 className="logo" onClick={handleLogoClick}>
        Klassy T-Shirts
      </h2>

      {/* Hamburger menu (mobile) */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <i className={menuOpen ? 'bx bx-x' : 'bx bx-menu'}></i>
      </div>

      {/* Right-side nav with only "Home" */}
      <div className={`nav-buttons ${menuOpen ? 'active' : ''}`}>
        <Link to="/rentalHome" onClick={() => setMenuOpen(false)}>
          <button className="nav-btn">
            <i className="bx bx-home"></i> Home
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default NavbarOwner;
