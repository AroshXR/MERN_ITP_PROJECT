import React, { useState } from 'react';
import './ContactUs.css';

function ContactUs() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Your message has been sent!');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="contact-us-container">
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
    );
}

export default ContactUs;
