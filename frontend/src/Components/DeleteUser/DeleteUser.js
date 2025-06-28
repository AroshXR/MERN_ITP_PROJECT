// src/Components/DeleteUser/DeleteUser.js
import React, { useState } from 'react';
import './DeleteUser.css';
import NavBar from '../NavBar/navBar'; // Ensure NavBar is imported correctly

function DeleteUser() {
    // Dummy users (replace with API data later)
    const [users, setUsers] = useState([
        { id: 1, name: "Alice", age: 25, address: "Colombo" },
        { id: 2, name: "Bob", age: 30, address: "Galle" },
        { id: 3, name: "Charlie", age: 28, address: "Kandy" },
    ]);

    const handleDelete = (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this user?");
        if (confirmed) {
            setUsers(users.filter(user => user.id !== id));
            console.log("Deleted user with ID:", id);
            // TODO: Call backend DELETE API here
        }
    };

    return (
        <div className="delete-user-container">
            <NavBar />
            <div className="delete-container">
                <h2>Delete User</h2>
                {users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    <ul className="user-list">
                        {users.map(user => (
                            <li key={user.id}>
                                <span>{user.name} ({user.age}) - {user.address}</span>
                                <button onClick={() => handleDelete(user.id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default DeleteUser;
