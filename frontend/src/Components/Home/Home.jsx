// src/Components/Home/Home.js
import React from 'react';
import NavBar from '../NavBar/navBar'; // Make sure navBar.js uses capital 'N'
import './Home.css'; // Import CSS
import { Link, Outlet } from 'react-router-dom';
import Footer from '../Footer/Footer'; // Import Footer component
import ContactUs from './ContactUs';
import AboutUs from './AboutUs';

function Home() {
  return (
    <div className="home-container">
      <NavBar />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Create Your
              <span className="gradient-text"> Perfect </span>
              T-Shirt
            </h1>
            <p className="hero-description">
              Express your unique style with our premium custom t-shirts. 
              Design, customize, and wear your creativity with confidence.
            </p>
            
            <div className="startButtons">
              <Link to="/login" className="startButtonsprimary">
                <span style={{ color: "#fff", }}>Start Designing</span>
                <i className="arrow-icon">→</i>
              </Link>
              <Link to="#about" className="startButtonssecondary">
                <span>Learn More</span>
              </Link>
            </div>
          
          </div>
          
          <div className="hero-visual">
            <div className="tshirt-showcase">
              <div className="tshirt-card">
                <span className="tshirt-label">Classic Fit</span>
              </div>
              <div className="tshirt-card">
                <span className="tshirt-label">Premium</span>
              </div>
              <div className="tshirt-card">
                <span className="tshirt-label">Custom Design</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Klassy T-Shirts?</h2>
            <p>Experience the perfect blend of quality, creativity, and style</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎨</div>
              <h3>Custom Designs</h3>
              <p>Create unique designs with our intuitive design tools and premium templates.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Premium Quality</h3>
              <p>High-quality materials and printing techniques for long-lasting, vibrant designs.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Eco-Friendly</h3>
              <p>Sustainable materials and environmentally conscious production processes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section-wrapper">
        <AboutUs />
      </section>

      <Outlet />
      <Footer />
    </div>
  );
}

export default Home;
