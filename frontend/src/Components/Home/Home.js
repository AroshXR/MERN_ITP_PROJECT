// src/Components/Home/Home.js
import React from 'react';
import NavBar from '../NavBar/navBar'; // Make sure navBar.js uses capital 'N'
import './Home.css'; // Import CSS
import { Link } from 'react-router-dom';
import Footer from '../Footer/Footer'; // Import Footer component

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
        <h1>Welcome to User Management System</h1>
        <p>Manage your users with ease — Add, Update, or Delete in just a click.</p>
        <Link to="/login">
          <button className="cta-button">Get Started</button>
        </Link>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
