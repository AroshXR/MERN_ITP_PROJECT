import { useEffect, useState } from 'react';
import jsPDF from 'jspdf'; // <-- import jsPDF
import NavBar from '../NavBar/navBar';
import axios from 'axios';
import User from './user.js';
import './ViewDetails.css';
import { Link } from 'react-router-dom';
import Footer from '../Footer/Footer'; // Importing the Footer component
import { useNavigate } from 'react-router-dom'; // Importing useNavigate for navigation

const URL = "http://localhost:5000/users";

const fetchHandler = async () => {
    try {
        const response = await axios.get(URL);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
    }
};

function ViewDetails() {

    const navigate = useNavigate();

    useEffect(() => {
        const username = localStorage.getItem("username");
        if (!username) {
            alert("Please log in to access this page.");
            navigate("/login");
        }
    }, [navigate]);


    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchHandler()
            .then((data) => {
                setUsers(data.users);
            })
            .catch((error) => {
                console.error('Failed to load users:', error);
                alert('Failed to load users. Please try again.');
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

        // Title styling
        doc.setFontSize(22);
        doc.setTextColor("#6a0dad"); // purple-ish
        doc.setFont("helvetica", "bold");
        doc.text("User Details Report", 70, 15);

        // Add a colored line under the title
        doc.setDrawColor(106, 13, 173); // rgb for #6a0dad
        doc.setLineWidth(1.5);
        doc.line(20, 20, 190, 20);

        let y = 30;
        users.forEach((user, index) => {
            // Alternate row background for readability
            if (index % 2 === 0) {
                doc.setFillColor(230, 220, 255, 0.3); // light purple with alpha
                doc.rect(10, y - 6, 190, 25, "F"); // filled rectangle behind text
            }

            // User details text style
            doc.setFontSize(14);
            doc.setTextColor("#000000");

            doc.setFont("helvetica", "bold");
            doc.text(`Name:`, 12, y);
            doc.setFont("helvetica", "normal");
            doc.text(`${user.name}`, 40, y);

            doc.setFont("helvetica", "bold");
            doc.text(`Age:`, 12, y + 7);
            doc.setFont("helvetica", "normal");
            doc.text(`${user.age}`, 40, y + 7);

            doc.setFont("helvetica", "bold");
            doc.text(`Address:`, 12, y + 14);
            doc.setFont("helvetica", "normal");
            doc.text(`${user.address}`, 40, y + 14);

            y += 30;
            // Add page break if y exceeds page height (approx 280)
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
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

    const username = localStorage.getItem("username");

    return (
        <div>
            <NavBar />
            {/* <div className="background-graffiti">
                <div className="blob blob1"></div>
                <div className="blob blob2"></div>
                <div className="blob blob3"></div>
            </div> */}

            <div className="view-data-container">
                <h1>Hello, {username} !</h1>
                <div className="search-container">
                    <div className="searchBar">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button onClick={handleSearch} className="search-button">Search</button>
                </div>

                <div className="add-buttons">
                    <Link to="/add"><button>Add User</button></Link>
                </div>

                {noResults ? (
                    <p style={{ textAlign: 'center', color: 'red', fontSize: '16px', fontWeight: 'bold' }}>No results found</p>
                ) : (

                    <div className="view-details-container">
                        {users && users.map((user, i) => (
                            <User key={i} user={user} onEdit={handleEdit} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
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
            <Footer />
        </div>
    );
}

export default ViewDetails;
