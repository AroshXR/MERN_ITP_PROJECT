// src/Components/Home/Home.js
import React from 'react';
import NavBar from '../NavBar/navBar'; // Make sure navBar.js uses capital 'N'
import './Home.css'; // Import CSS
import {Link} from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <NavBar />
      <div className="home-content">
        <h1>Welcome to User Management System</h1>
        <p>Manage your users with ease — Add, Update, or Delete in just a click.</p>
        <Link to="/viewDetails">
          <button className="cta-button">Get Started</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
