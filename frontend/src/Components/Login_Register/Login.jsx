import React from 'react'
import './LoginPage.css';
import loginImage from '../images/login-img.jpg'; // Assuming you have a CSS file for styling
import NavBar from '../NavBar/navBar'; // Importing the NavBar component
import Footer from '../Footer/Footer'; // Importing the Footer component
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation

function LoginPage() {

  const history = useNavigate();
  const [error, setError] = useState(false);
  const [user, setUser] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value
    }));
    setError(false);
  };


  const sendRequest = async () => {
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username: user.username,
        password: user.password
      });
      return response.data;
    } catch (error) {
      console.error('Login request failed:', error);
      throw error;
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sendRequest();
      if (response.status === "ok") {
        localStorage.setItem("username", user.username); // or sessionStorage
        setError(false);
        history('/viewDetails');
      } else {  
        setError(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(true);
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
            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="type">As a:</label>
                <select id="type" name="type" value={user.type} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="tailor">Tailor</option>
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
              {error && (
                <small className="error-message">
                  Invalid username or password
                </small>
              )}
              <button type="submit">Login</button>
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