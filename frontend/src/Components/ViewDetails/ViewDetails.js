import { useEffect, useState } from 'react';
import jsPDF from 'jspdf'; // <-- import jsPDF
import NavBar from '../NavBar/navBar';
import axios from 'axios';
import User from './user';
import './ViewDetails.css';

const URL = "http://localhost:5000/users";

const fetchHandler = async () => {
    return await axios.get(URL).then((response) => response.data);
};

function ViewDetails() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchHandler().then((data) => {
            setUsers(data.users);
        });
    }, []);

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleModalChange = (e) => {
        setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        await axios.put(`http://localhost:5000/users/${selectedUser._id}`, selectedUser);
        setShowModal(false);
        fetchHandler().then((data) => setUsers(data.users));
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this user?");
        if (!confirmed) return;

        try {
            await axios.delete(`http://localhost:5000/users/${id}`);
            const updatedData = await fetchHandler();
            setUsers(updatedData.users);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("User Details Report", 70, 10);

        let y = 20;
        users.forEach((user, index) => {
            doc.setFontSize(12);
            doc.text(`Name: ${user.name}`, 10, y);
            doc.text(`Age: ${user.age}`, 10, y + 7);
            doc.text(`Address: ${user.address}`, 10, y + 14);
            y += 25;
        });

        doc.save("user_details.pdf");
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [noResults, setNoResults] = useState(false);

    const handleSearch = () => {
        fetchHandler().then((data) => {
            const fetchHandler = data.users.filter((user) =>
                Object.values(user).some((field) =>
                    field.toString().toLowerCase().includes(searchQuery.toLowerCase())
                ))
            setUsers(fetchHandler);
            setNoResults(fetchHandler.length === 0);
        });
    }

    useEffect(() => {
        if (searchQuery.trim() === "") {
            fetchHandler().then((data) => {
                setUsers(data.users);
                setNoResults(false);
            });
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchHandler().then((data) => {
            const filtered = data.users.filter((user) =>
                Object.values(user).some((field) =>
                    field.toString().toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
            setUsers(filtered);
            setNoResults(filtered.length === 0);
        });
    }, [searchQuery]);

    return (
        <div>
            <NavBar />
            <h1>View User Details</h1>
            <div className="search-container">
                <input className='searchBar' type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}></input>
                <button onClick={handleSearch} className="search-button">Search</button>
            </div>
            {noResults ? (
                <p style={{ textAlign: 'center', color: 'red', fontSize: '16px', fontWeight: 'bold' }}>No results found</p>
            ) : (

                <div className="view-details-container">
                    {users && users.map((user, i) => (
                        <User key={i} user={user} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                </div>
            )};
            <div className="print-button-container">
                <button onClick={handleDownloadPDF} className="print-button">Download PDF</button>
            </div>

            {showModal && selectedUser && (
                <div className="modal">
                    <div className="modal-content">
                        <h2 style={{ textAlign: 'center' }}>Edit User</h2>
                        <input name="name" value={selectedUser.name} onChange={handleModalChange} />
                        <input name="age" type="number" value={selectedUser.age} onChange={handleModalChange} />
                        <input name="address" value={selectedUser.address} onChange={handleModalChange} />
                        <button onClick={handleUpdate}>Update</button>
                        <button onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewDetails;
