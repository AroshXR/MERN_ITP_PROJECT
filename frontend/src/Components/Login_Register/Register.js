import React, { useState } from 'react';
import './LoginPage.css';
import regImage from '../images/register-image-png.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../NavBar/navBar'; // Importing the NavBar component
import Footer from '../Footer/Footer'; // Importing the Footer component

function RegisterPage() {
    const history = useNavigate();

    const [user, setUser] = useState({
        username: '',
        address: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const passwordsMatch = user.password === user.confirmPassword;

    const sendRequest = async () => {
        try {
            const response = await axios.post("http://localhost:5000/register", {
                username: user.username,
                address: user.address,
                email: user.email,
                password: user.password
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (passwordsMatch) {
            sendRequest().then(() => {
                alert('Registration successful!');
                history('/login'); // Redirect to login page after successful registration
            }).catch((error) => {
                console.error('Registration failed:', error);
                alert('Registration failed. Please try again.');
            });
        }
    };


    return (

        <div className="container">
            <NavBar />
            <div className="loginPage-container">
                <div className="login-header">
                    <h1>Create an Account</h1>
                    <p>Please fill in the details to register</p>
                    <img className='loginImage' src={regImage} alt="Register Illustration" />
                </div>

                <div className="login-container">
                    <h2>Register</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username:</label>
                            <input type="text" id="username" name="username" value={user.username} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">Address:</label>
                            <input type="text" id="address" name="address" value={user.address} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" name="email" value={user.email} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password:</label>
                            <input type="password" id="password" name="password" value={user.password} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password:</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={user.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            {!passwordsMatch && (
                                <small className="error-message">Passwords do not match</small>
                            )}
                        </div>
                        <button type="submit" disabled={!passwordsMatch}>Register</button>
                        <small className="register-link" >
                            Already have an account? <a href="/login">Login here</a>
                        </small>
                    </form>
                </div>
            </div>
            <Footer />
        </div>


    );
}

export default RegisterPage;
