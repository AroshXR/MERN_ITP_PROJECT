import React from "react";
import { useNavigate } from "react-router-dom";

import "./AboutUs.css";
import { Link } from 'react-router-dom';

function AboutUs() {
    const navigate = useNavigate();

    return (
            <div className="about-content">
                <h2>About Klassy T Shirts</h2>
                <p>Discover our story, mission, and values.</p>

                <div className="about-sections">
                    <section className="about-section">
                        <h2>Our Story</h2>
                        <p>
                            Klassy T Shirts was founded to bring creativity and individuality to everyone’s wardrobe. We provide high-quality custom apparel designed to let you express yourself.
                        </p>
                    </section>

                    <section className="about-section">
                        <h2>Our Mission</h2>
                        <p>
                            Our mission is to empower customers to create personalized designs while delivering comfort, style, and durability.
                        </p>
                    </section>

                    <section className="about-section">
                        <h2>Our Values</h2>
                        <ul>
                            <li><strong>Creativity:</strong> Encouraging self-expression through unique designs.</li>
                            <li><strong>Quality:</strong> Premium materials and excellent craftsmanship.</li>
                            <li><strong>Customer Satisfaction:</strong> Your happiness is our priority.</li>
                            <li><strong>Sustainability:</strong> Eco-friendly practices whenever possible.</li>
                        </ul>
                    </section>

                    <section className="about-section">
                        <h2>Contact Us</h2>
                        <p>
                            Have questions or want to learn more?
                            <Link to="/contact" style={{ textDecoration: 'none', marginLeft: '30px' }}>
                                <button className="cta-button">Send a message</button>
                            </Link>
                            <br />
                            Or Reach out at <a href="mailto:support@klassytshirts.com">support@klassytshirts.com</a>
                        </p>
                    </section>
                </div>
            </div>
    );
}

export default AboutUs;
