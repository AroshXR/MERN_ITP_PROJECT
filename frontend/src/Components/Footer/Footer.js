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
      <div className="footer-links">
        <Link to="#"><i className='fab fa-instagram'></i></Link>
        <Link to="#"><i className='fab fa-facebook-f'></i></Link>
        <Link to="#"><i className='fab fa-github'></i></Link>
      </div>
      <p className="footer-text">© {new Date().getFullYear()} aroshtunes_06. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
