// src/Components/UpdateUser/UpdateUser.js
import React, { useState } from 'react';
import '../AddUser/userStyles.css';
import NavBar from '../NavBar/navBar'; // Ensure NavBar is imported correctly

function UpdateUser() {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        address: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Update User Form Submitted:', formData);
        // TODO: send PUT request to backend
    };

    return (
        <div className="update-container">
            <NavBar />
            <div className="form-container">
                <h2>Update User</h2>
                <form onSubmit={handleSubmit}>
                    <input name="name" type="text" placeholder="Name" onChange={handleChange} required />
                    <input name="age" type="number" placeholder="Age" onChange={handleChange} required />
                    <input name="address" type="text" placeholder="Address" onChange={handleChange} required />
                    <button type="submit">Update</button>
                </form>
            </div>
        </div>
    );
}

export default UpdateUser;
