// src/Components/User/User.js
import React from 'react';
import './user.css';

function User(props) {
  const { _id, name, age, address } = props.user;

  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p><strong>Age:</strong> {age}</p>
      <p><strong>Address:</strong> {address}</p>
      <div className="user-actions">
        <button onClick={() => props.onEdit(props.user)}>Edit</button>
        <button onClick={() => props.onDelete(_id)}>Delete</button>
      </div>
    </div>
  );
}

export default User;
