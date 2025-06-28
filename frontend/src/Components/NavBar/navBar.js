import React from 'react';
import { Link } from 'react-router-dom';
import './navBar.css';

function NavBar() {
  return (
    <nav className="navbar">
      <Link to="/"><h2 className="logo">User Manager</h2></Link>
      <div className="nav-buttons">
        <Link to="/add"><button>Add User</button></Link>
      </div>
    </nav>
  );
}

export default NavBar;
