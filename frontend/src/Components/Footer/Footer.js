// Footer.js
import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

function Footer() {
    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3 className="footer-logo">Klassy T Shirts</h3>
            <p className="footer-tagline">Custom clothing for every style</p>
          </div>
          
          <div className="footer-social">
            <h4 className="footer-section-title">Follow Us</h4>
            <div className="footer-links">
              <Link to="#" aria-label="Instagram">
                <i className='fab fa-instagram'></i>
              </Link>
              <Link to="#" aria-label="Facebook">
                <i className='fab fa-facebook-f'></i>
              </Link>
              <Link to="#" aria-label="X">
                <i className='fab fa-x'></i>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-text">
            © {new Date().getFullYear()} Klassy Shirts. All rights reserved.
          </p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;