import React from "react";
import { useNavigate } from "react-router-dom";

import "./AboutUs.css";
import { Link } from 'react-router-dom';

function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="about-content">
            <h2>About Klassy T-Shirts</h2>
            <p>Discover our story, mission, and values that drive us to create exceptional custom apparel experiences.</p>

            <div className="about-sections">
                <section className="about-section">
                    <h2>Our Story</h2>
                    <p>
                        Founded with a vision to revolutionize custom apparel, Klassy T-Shirts emerged from the belief that everyone deserves to wear their creativity. We combine cutting-edge design technology with premium materials to bring your unique vision to life.
                    </p>
                    <p>
                        From our humble beginnings to becoming a trusted name in custom apparel, we've remained committed to quality, innovation, and customer satisfaction.
                    </p>
                </section>

                <section className="about-section">
                    <h2>Our Mission</h2>
                    <p>
                        To empower individuals and businesses to express their unique identity through high-quality, customizable apparel that combines style, comfort, and durability.
                    </p>
                    <p>
                        We strive to make custom design accessible, affordable, and enjoyable for everyone, while maintaining the highest standards of quality and service.
                    </p>
                </section>

                <section className="about-section">
                    <h2>Our Values</h2>
                    <ul>
                        <li><strong>Creativity:</strong> Fostering self-expression through innovative design tools and unlimited customization options.</li>
                        <li><strong>Quality:</strong> Using premium materials and state-of-the-art printing techniques for lasting results.</li>
                        <li><strong>Customer-Centric:</strong> Putting your satisfaction and experience at the heart of everything we do.</li>
                        <li><strong>Sustainability:</strong> Committed to eco-friendly practices and responsible manufacturing processes.</li>
                        <li><strong>Innovation:</strong> Continuously improving our technology and services to exceed expectations.</li>
                    </ul>
                </section>

                
            </div>

            <section className="about-sections">
                <section className="contact-section">
                    <h2>Get In Touch</h2>
                    <p>
                        Ready to bring your ideas to life? We're here to help you create something amazing.
                    </p>
                    <Link to="/contact">
                        <button className="cta-button">Start Your Project</button>
                    </Link>
                    <p>
                        Questions? Reach out to our team at <a href="mailto:support@klassytshirts.com">support@klassytshirts.com</a>
                    </p>
                    <p>
                        Follow us on social media for design inspiration and updates on new features.
                    </p>
                </section>
            </section>

            <div className="about-stats">
                <div className="stat-item">
                    <span className="stat-number">15K+</span>
                    <span className="stat-label">Happy Customers</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">75K+</span>
                    <span className="stat-label">Designs Created</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">4.9★</span>
                    <span className="stat-label">Customer Rating</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">99%</span>
                    <span className="stat-label">Satisfaction Rate</span>
                </div>
            </div>
        </div>
    );
}

export default AboutUs;
