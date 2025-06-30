import { Link } from 'react-router-dom';
import './navBar.css';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation

// Make sure Boxicons CDN is added in index.html or use <link> in public/index.html

function NavBar() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const navigate = useNavigate();

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
      <h2 className="logo" onClick={handleLogoClick}>User Manager</h2>
      <div className="nav-buttons">
        <Link to="#">
          <button className="nav-btn">
            <i className='bx bx-info-circle'></i> About Us
          </button>
        </Link>
        <Link to="#">
          <button className="nav-btn">
            <i className='bx bx-phone'></i> Contact Us
          </button>
        </Link>
        {!isHomePage && !isLoginPage && !isRegisterPage && (
          <button onClick={handleLogout}><i className='bx bx-log-out'></i> Logout</button>
        )}
      </div>

    </nav>
  );
}

export default NavBar;
