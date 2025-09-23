import { Link } from 'react-router-dom';
import './navBar.css';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isCustomizerPage = location.pathname === '/customizer';

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleLogoClick = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <h2 className="logo" onClick={handleLogoClick}>Klassy T Shirts</h2>

      {/* Hamburger Menu Icon */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <i className={menuOpen ? 'bx bx-x' : 'bx bx-menu'}></i>
      </div>

      <div className={`nav-buttons ${menuOpen ? 'active' : ''}`}>
        <Link to="/customizer" onClick={() => setMenuOpen(false)}>
          <button className="nav-btn">
            <i className='bx bx-info-circle'></i> Customizer
          </button>
        </Link>
        <Link to="/career" onClick={() => setMenuOpen(false)}>
          <button className="nav-btn">
            <i className='bx bx-briefcase'></i> Career
          </button>
        </Link>
        <Link to="/color-guide" onClick={() => setMenuOpen(false)}>
          <button className="nav-btn">
            <i className='bx bx-palette'></i> Color Guide
          </button>
        </Link>
        <Link to="/applicant-dashboard" onClick={() => setMenuOpen(false)}>
          <button className="nav-btn">
            <i className='bx bx-user-check'></i> My Applications
          </button>
        </Link>
        <Link to="/admin" onClick={() => setMenuOpen(false)}>
          <button className="nav-btn">
            <i className='bx bx-shield'></i> Admin
          </button>
        </Link>
        <Link to="/admin-jobs" onClick={() => setMenuOpen(false)}>
          <button className="nav-btn">
            <i className='bx bx-cog'></i> Manage Jobs
          </button>
        </Link>
        <Link to="/paymentDetails" onClick={() => setMenuOpen(false)}>
          <button className="nav-btn">
            <i className='bx bx-credit-card'></i> Payment Details
          </button>
        </Link>
        <Link to="/contact" onClick={() => setMenuOpen(false)}>
          <button className="nav-btn">
            <i className='bx bx-phone'></i> Contact Us
          </button>
        </Link>
        {!isHomePage && !isLoginPage && !isRegisterPage && !isCustomizerPage && (
          <button onClick={() => { handleLogout(); setMenuOpen(false); }}>
            <i className='bx bx-log-out'></i> Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
