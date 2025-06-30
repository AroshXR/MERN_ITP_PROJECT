import React from 'react'
import './LoginPage.css';
import loginImage from '../images/user-login-png.png'; // Assuming you have a CSS file for styling
import NavBar from '../NavBar/navBar'; // Importing the NavBar component
import Footer from '../Footer/Footer'; // Importing the Footer component

function LoginPage() {
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
          <form>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input type="password" id="password" name="password" required />
            </div>
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