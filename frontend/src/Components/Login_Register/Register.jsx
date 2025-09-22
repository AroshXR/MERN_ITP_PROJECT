import React, { useState } from 'react';
import './LoginPage.css';
import regImage from '../images/register-img.jpg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';

function RegisterPage() {
    const history = useNavigate();

    const [user, setUser] = useState({
        username: '',
        address: '',
        email: '',
        password: '',
        confirmPassword: '',
        type: 'Customer'
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prev) => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const passwordsMatch = user.password === user.confirmPassword;

    const sendRequest = async () => {
        try {
            const response = await axios.post('http://localhost:5001/register', {
                username: user.username,
                address: user.address,
                email: user.email,
                password: user.password,
                type: user.type || 'Customer'
            });
            return response.data;
        } catch (error) {
            console.error('Registration request failed:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.response?.status === 400) {
                throw new Error('Invalid registration data. Please check your information.');
            } else if (error.response?.status === 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error('Registration failed. Please check your connection and try again.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Registration attempt:', {
            username: user.username,
            email: user.email,
            address: user.address,
            type: user.type,
            passwordLength: user.password.length,
            passwordsMatch
        });

        if (!passwordsMatch) {
            setError('Passwords do not match');
            return;
        }

        if (user.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            console.log('Sending registration request...');
            const result = await sendRequest();
            console.log('Registration response:', result);

            if (result.status === 'ok') {
                alert('Registration successful! Please login with your new account.');
                history('/login');
            } else {
                setError(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message);
        } finally {
            setIsSubmitting(false);
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
                    {error && (
                        <div className="error-message-container">
                            <small className="error-message">{error}</small>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="userType">Registering as:</label>
                            <select id="userType" name="type" value={user.type} onChange={handleChange}>
                                <option value="Customer">Customer</option>
                                <option value="Applicant">Applicant</option>
                                <option value="Tailor">Tailor</option>
                            </select>
                        </div>
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
                            {!passwordsMatch && user.confirmPassword && (
                                <small className="error-message">Passwords do not match</small>
                            )}
                        </div>
                        <button type="submit" disabled={!passwordsMatch || isSubmitting}>
                            {isSubmitting ? 'Registering...' : 'Register'}
                        </button>
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
