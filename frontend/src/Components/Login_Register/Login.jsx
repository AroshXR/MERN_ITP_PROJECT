import React from 'react'
import './LoginPage.css';
import loginImage from '../images/login-img.jpg'; // Assuming you have a CSS file for styling
import NavBar from '../NavBar/navBar'; // Importing the NavBar component
import Footer from '../Footer/Footer'; // Importing the Footer component
import axios from 'axios';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation
import { useAuth } from '../../AuthGuard/authGuard'; // Importing the useAuth hook

function LoginPage() {

  const history = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState({
    username: '',
    password: '',
    type: ''
  });
  const { login } = useAuth();

  // Get the intended destination from location state, or default to userHome
  const from = location.state?.from?.pathname || '/userHome';

  // Test backend connectivity
  const testBackendConnection = async () => {
    try {
      const response = await axios.get('http://localhost:5001/test');
      console.log('Backend connection test:', response.data);
      return true;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const sendRequest = async () => {
    try {
      console.log('Sending login request:', { username: user.username, type: user.type });
      const response = await axios.post("http://localhost:5001/login", {
        username: user.username,
        password: user.password,
        type: user.type
      });
      console.log('Raw login response:', response);
      return response.data;
    } catch (error) {
      console.error('Login request failed:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error('Invalid login data. Please check your information.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      } else {
        throw new Error('Login failed. Please check your connection and try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user.username || !user.password || !user.type) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Test backend connectivity first
      const isBackendConnected = await testBackendConnection();
      if (!isBackendConnected) {
        setError('Cannot connect to server. Please check if the backend is running.');
        return;
      }

      const response = await sendRequest();
      console.log('Login response:', response); // Debug log
      
      if (response.status === "ok") {
        const { token, user: userData } = response;
        console.log('Login successful, user data:', userData);
        console.log('Token received:', token ? 'exists' : 'none');
        
        // Store token and user data in AuthContext
        login(token, userData);

        setError('');
        
        // Redirect based on user type
        if (userData.type === 'Admin') {
          navigate('/adminHome');
        } else {
          // Redirect to the original destination or userHome
          history(from, { replace: true });
        }
      } else {  
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
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
            <h1>Welcome Back!</h1>
            <p>Please login to continue</p>
            <img className='loginImage' src={loginImage} alt="Login Illustration" />
          </div>

          <div className="login-container">
            <h2>Login</h2>
            {error && (
              <div className="error-message-container">
                <small className="error-message">{error}</small>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="type">As a:</label>
                <select id="type" name="type" value={user.type} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                  <option value="Tailor">Tailor</option>  
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" value={user.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" value={user.password} onChange={handleChange} required />
              </div>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
              <small className="register-link" >
                Don't have an account? <a href="/register">Register here</a>
              </small>
            </form>
          </div>
        </div>
        <Footer />
      </div>


    )
  }

  export default LoginPage