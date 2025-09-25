import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../NavBar/navBar';
import Footer from '../Footer/Footer';
import './Unauthorized.css';

function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div className="w-full min-h-screen flex flex-col">
            <NavBar />
            <div className="unauthorized-container">
                <div className="unauthorized-content">
                    <div className="unauthorized-icon">🚫</div>
                    <h1>Access Denied</h1>
                    <p>Sorry, you don't have permission to access this page.</p>
                    <p>Please contact an administrator if you believe this is an error.</p>
                    <div className="unauthorized-actions">
                        <button 
                            className="supbtn"
                            onClick={() => navigate('/')}
                        >
                            Go to Home
                        </button>
                        <button 
                            className="supbtn"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Unauthorized;
