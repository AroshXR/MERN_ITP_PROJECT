// src/Components/Home/Home.js
import React from 'react';
import NavBar from '../NavBar/navBar'; // Make sure navBar.js uses capital 'N'
import './Home.css'; // Import CSS
import { Link, Outlet } from 'react-router-dom';
import Footer from '../Footer/Footer'; // Import Footer component
import ContactUs from './ContactUs';

function Home() {
  return (
    <div className="home-container">
      <NavBar />
      <div className="background-graffiti">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>
      <div className="home-content">
        <h1>Welcome to Klassy Shirts</h1>
        <p>Customize your style with our unique shirt designs.</p>
        <Link to="/login">
          <button className="cta-button">Get Started</button>
        </Link>
        <Outlet />
        <ContactUs />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
