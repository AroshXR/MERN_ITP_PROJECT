import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthGuard/AuthGuard';
import './navBar.css';

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = isAuthenticated();
  const userType = currentUser?.type;

  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isCustomizerPage = location.pathname === '/customizer';

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    closeMenu();
  };

  const handleLogoClick = () => {
    navigate('/');
    closeMenu();
  };

  const showAuthLinks = !isLoggedIn && !isLoginPage && !isRegisterPage;
  const showLogout = isLoggedIn && !(isHomePage || isLoginPage || isRegisterPage || isCustomizerPage);
  const isCustomerOrApplicant = userType === 'Customer' || userType === 'Applicant';

  return (
    <nav className="navbar">
      <h2 className="logo" onClick={handleLogoClick}>Klassy T Shirts</h2>

      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        <i className={menuOpen ? 'bx bx-x' : 'bx bx-menu'}></i>
      </div>

      <div className={`nav-buttons ${menuOpen ? 'active' : ''}`}>
        <Link to="/customizer" onClick={closeMenu}>
          <button className="nav-btn">
            <i className='bx bx-info-circle'></i> Customizer
          </button>
        </Link>
        <Link to="/career" onClick={closeMenu}>
          <button className="nav-btn">
            <i className='bx bx-briefcase'></i> Career
          </button>
        </Link>
        <Link to="/color-guide" onClick={closeMenu}>
          <button className="nav-btn">
            <i className='bx bx-palette'></i> Color Guide
          </button>
        </Link>
        {userType === 'Applicant' && (
          <Link to="/applicant-dashboard" onClick={closeMenu}>
            <button className="nav-btn">
              <i className='bx bx-user-check'></i> My Applications
            </button>
          </Link>
        )}
        {userType === 'Tailor' && (
          <Link to="/tailorHome" onClick={closeMenu}>
            <button className="nav-btn">
              <i className='bx bx-scissors'></i> Tailor Home
            </button>
          </Link>
        )}
        {userType === 'Admin' && (
          <>
            <Link to="/admin" onClick={closeMenu}>
              <button className="nav-btn">
                <i className='bx bx-shield'></i> Admin
              </button>
            </Link>
            <Link to="/admin-jobs" onClick={closeMenu}>
              <button className="nav-btn">
                <i className='bx bx-cog'></i> Manage Jobs
              </button>
            </Link>
            <Link to="/admin/users" onClick={closeMenu}>
              <button className="nav-btn">
                <i className='bx bx-group'></i> Users
              </button>
            </Link>
          </>
        )}
        {isCustomerOrApplicant && (
          <Link to="/paymentDetails" onClick={closeMenu}>
            <button className="nav-btn">
              <i className='bx bx-credit-card'></i> Payment Details
            </button>
          </Link>
        )}
        <Link to="/contact" onClick={closeMenu}>
          <button className="nav-btn">
            <i className='bx bx-phone'></i> Contact Us
          </button>
        </Link>
        {isLoggedIn && (
          <Link to="/user/account" onClick={closeMenu}>
            <button className="nav-btn">
              <i className='bx bx-user-circle'></i> My Account
            </button>
          </Link>
        )}
        {showAuthLinks && (
          <>
            <Link to="/login" onClick={closeMenu}>
              <button className="nav-btn">
                <i className='bx bx-log-in'></i> Login
              </button>
            </Link>
            <Link to="/register" onClick={closeMenu}>
              <button className="nav-btn">
                <i className='bx bx-user-plus'></i> Register
              </button>
            </Link>
          </>
        )}
        {isLoggedIn && showLogout && (
          <button onClick={handleLogout}>
            <i className='bx bx-log-out'></i> Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
