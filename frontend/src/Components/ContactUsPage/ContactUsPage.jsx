import React, { useState } from 'react';
import './ContactUsPage.css';
import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';

function ContactUs() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const navigate = useNavigate();


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Your message has been sent!');
        setFormData({ name: '', email: '', message: '' });
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (

        <div>
            <NavBar />
            <button className='contact-form-button back-button' onClick={handleBack}>
                Back
            </button>

            <div className="contact-container">
                <h1>Contact Us</h1>
                <p>If you have any questions, feel free to reach out using the form below.</p>

                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                        <label className='contact-form-label'>Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className='contact-form-label'>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className='contact-form-label'>Message</label>
                        <textarea
                            name="message"
                            placeholder="Your Message"
                            rows="5"
                            value={formData.message}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <button className='contact-form-button' type="submit">Send Message</button>
                </form>
            </div>
            <Footer />
        </div>


    );
}

export default ContactUs;
