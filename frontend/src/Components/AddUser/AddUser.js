// src/Components/AddUser/AddUser.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './userStyles.css';
import NavBar from '../NavBar/navBar'; // Ensure NavBar is imported correctly
import axios from 'axios';

function AddUser() {
    const history = useNavigate();
    const [inputs, setInputs] = useState({
        name: '',
        age: '',
        address: '',
    });

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Add User Form Submitted:', inputs);
        // await sendRequest();
        // history('viewDetails');
        sendRequest().then(() => history('/viewDetails')); // Redirect to home after submission
    }

    const sendRequest = async () => {
        await axios.post("http://localhost:5000/users", {
            name: String(inputs.name),
            age: Number(inputs.age),
            address: String(inputs.address),
        }).then((response) => response.data);
    }


    return (
        <div className="user-container">
            <NavBar />
            <div className="background-graffiti">
                <div className="blob blob1"></div>
                <div className="blob blob2"></div>
                <div className="blob blob3"></div>
            </div>
            <div className="form-container">
                <h2>Add User</h2>
                <form onSubmit={handleSubmit}>
                    <input name="name" type="text" placeholder="Name" onChange={handleChange} value={inputs.name} required />
                    <input name="age" type="number" placeholder="Age" onChange={handleChange} value={inputs.age} required />
                    <input name="address" type="text" placeholder="Address" onChange={handleChange} value={inputs.address} required />
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>

    );
}

export default AddUser;
