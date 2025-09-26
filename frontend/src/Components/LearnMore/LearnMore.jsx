import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import './LearnMore.css';

const LearnMore = () => {
  const navigate = useNavigate();

  return (
    <div className="learn-more-container">
      <NavBar />
      
      {/* Hero Section */}
      <section className="learn-hero">
        <div className="learn-hero-content">
          <div className="kicker">About Klassy T‑Shirts</div>
          <h1 className="learn-hero-title">
            Discover the Art of 
            <span className="gradient-text"> Custom T-Shirt Design</span>
          </h1>
          <p className="learn-hero-description">
            Welcome to Klassy T-Shirts - where creativity meets quality. Learn how we're revolutionizing 
            the custom apparel industry with innovative design tools and premium materials.
          </p>
          <div className="accent-bar"/>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2>Our Story</h2>
              <p>
                Founded with a passion for self-expression and quality craftsmanship, Klassy T-Shirts 
                began as a vision to make custom apparel accessible to everyone. We believe that clothing 
                should be more than just fabric - it should be a canvas for your creativity.
              </p>
              <p>
                Today, we've grown into a comprehensive platform that combines cutting-edge design technology 
                with traditional quality manufacturing, serving thousands of customers worldwide.
              </p>
              <div className="story-stats">
                <div className="stat">
                  <h3>50K+</h3>
                  <p>Happy Customers</p>
                </div>
                <div className="stat">
                  <h3>100K+</h3>
                  <p>Designs Created</p>
                </div>
                <div className="stat">
                  <h3>99%</h3>
                  <p>Satisfaction Rate</p>
                </div>
              </div>
            </div>
            <div className="story-visual">
              <div className="story-image-placeholder">
                <div className="design-preview">
                  <span>🎨 Design Studio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="process-section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Create your perfect t-shirt in just a few simple steps</p>
          </div>
          
          <div className="process-grid">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Choose Your Style</h3>
                <p>Select from our range of premium t-shirt styles, colors, and sizes. Each shirt is made from high-quality, sustainable materials.</p>
              </div>
            </div>
            
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Design Your Shirt</h3>
                <p>Use our intuitive design tools to create your masterpiece. Upload images, add text, choose fonts, and position elements exactly where you want them.</p>
              </div>
            </div>
            
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Review & Order</h3>
                <p>Preview your design, make final adjustments, and place your order. We'll handle the printing and shipping with care.</p>
              </div>
            </div>
            
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Receive & Enjoy</h3>
                <p>Get your custom t-shirt delivered to your door and wear your creativity with pride. Share your design with the world!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="features-deep">
        <div className="container">
          <div className="section-header">
            <h2>What Makes Us Different</h2>
            <p>Discover the features that set Klassy T-Shirts apart from the competition</p>
          </div>
          
          <div className="features-detailed">
            <div className="feature-detailed">
              <div className="feature-icon-large">🎨</div>
              <h3>Advanced Design Tools</h3>
              <p>
                Our state-of-the-art design interface includes layers, effects, templates, and real-time 
                preview capabilities. Whether you're a beginner or a professional designer, our tools 
                adapt to your skill level.
              </p>
              <ul>
                <li>Drag-and-drop interface</li>
                <li>Professional templates</li>
                <li>Custom font library</li>
                <li>Image editing tools</li>
                <li>Real-time 3D preview</li>
              </ul>
            </div>
            
            <div className="feature-detailed">
              <div className="feature-icon-large">💎</div>
              <h3>Premium Materials</h3>
              <p>
                We use only the finest materials sourced from trusted suppliers. Our t-shirts are 
                pre-shrunk, colorfast, and designed to maintain their shape and vibrancy wash after wash.
              </p>
              <ul>
                <li>100% premium cotton options</li>
                <li>Eco-friendly fabric blends</li>
                <li>Pre-shrunk and pre-treated</li>
                <li>Fade-resistant printing</li>
                <li>Comfortable, breathable fit</li>
              </ul>
            </div>
            
            <div className="feature-detailed">
              <div className="feature-icon-large">🚀</div>
              <h3>Fast & Reliable</h3>
              <p>
                From design to delivery, we prioritize speed without compromising quality. Our 
                streamlined production process ensures your custom t-shirts are printed and 
                shipped within 3-5 business days.
              </p>
              <ul>
                <li>Quick turnaround times</li>
                <li>Real-time order tracking</li>
                <li>Quality control checks</li>
                <li>Secure packaging</li>
                <li>Multiple shipping options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section">
        <div className="container">
          <div className="tech-grid">
            <div className="tech-content">
              <h2>Cutting-Edge Technology</h2>
              <p>
                Behind every great custom t-shirt is innovative technology. We use the latest 
                printing techniques and design software to ensure your vision comes to life 
                exactly as you imagined.
              </p>
              <div className="tech-features">
                <div className="tech-feature">
                  <h4>🖨️ Digital Printing</h4>
                  <p>High-resolution digital printing for vibrant, detailed designs</p>
                </div>
                <div className="tech-feature">
                  <h4>🎯 Precision Placement</h4>
                  <p>Exact positioning technology for perfect design placement</p>
                </div>
                <div className="tech-feature">
                  <h4>🌈 Color Matching</h4>
                  <p>Advanced color calibration for accurate color reproduction</p>
                </div>
              </div>
            </div>
            <div className="tech-visual">
              <div className="tech-showcase">
                <div className="tech-item">
                  <span>Design Engine</span>
                </div>
                <div className="tech-item">
                  <span>Print Technology</span>
                </div>
                <div className="tech-item">
                  <span>Quality Control</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="sustainability-section">
        <div className="container">
          <div className="sustainability-content">
            <h2>Committed to Sustainability</h2>
            <p>
              We believe in creating beautiful products while protecting our planet. Our commitment 
              to sustainability runs through every aspect of our business, from material sourcing 
              to packaging and shipping.
            </p>
            <div className="sustainability-grid">
              <div className="sustainability-item">
                <div className="sustainability-icon">🌱</div>
                <h4>Eco-Friendly Materials</h4>
                <p>Organic cotton and recycled polyester options available</p>
              </div>
              <div className="sustainability-item">
                <div className="sustainability-icon">♻️</div>
                <h4>Minimal Waste</h4>
                <p>On-demand printing reduces overproduction and waste</p>
              </div>
              <div className="sustainability-item">
                <div className="sustainability-icon">📦</div>
                <h4>Sustainable Packaging</h4>
                <p>Recyclable and biodegradable packaging materials</p>
              </div>
              <div className="sustainability-item">
                <div className="sustainability-icon">🚛</div>
                <h4>Carbon Neutral Shipping</h4>
                <p>Offset shipping emissions through verified carbon credits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Create Your Perfect T-Shirt?</h2>
            <p>
              Join thousands of satisfied customers who have brought their creative visions to life 
              with Klassy T-Shirts. Start designing today and experience the difference quality makes.
            </p>
            <div className="cta-buttons">
              <button 
                className="cta-primary"
                onClick={() => navigate('/login')}
              >
                Start Designing Now
              </button>
              <button 
                className="cta-secondary"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LearnMore;
