import { Link } from 'react-router-dom';
import './navBar.css';
import React, { useEffect } from 'react';

// Make sure Boxicons CDN is added in index.html or use <link> in public/index.html

function NavBar() {

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <nav className="navbar">
      <Link to="/"><h2 className="logo">User Manager</h2></Link>
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
      </div>
    </nav>
  );
}

export default NavBar;
