import React from 'react';
import NavBar from '../../NavBar/navBar'; // Make sure navBar.js uses capital 'N'
import '../Home.css'; // Import CSS
import Outlet from '../../Outlet/Outlet';
import Footer from '../../Footer/Footer'; // Import Footer component

function UserHome() {
  return (
     <div className="home-container">
      <NavBar />
      <div className="background-graffiti">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>
      <div className="home-content">
        {/* <h1>Welcome to Klassy Shirts</h1>
        <p>Customize your style with our unique shirt designs.</p>
         */}
        <Outlet />
        
      </div>
      <Footer />
    </div>
  )
}

export default UserHome