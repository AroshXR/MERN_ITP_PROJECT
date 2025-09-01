import React, { useState, useEffect } from 'react';
import './ApplicantDashboard.css';
import EditApplicationForm from './EditApplicationForm';

const ApplicantDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    // For demo purposes, we'll use localStorage to store applications
    // In a real app, you'd fetch from the API using the user's email
    const storedApplications = localStorage.getItem('jobApplications');
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications));
    }
    setLoading(false);
  }, []);

  const handleSearch = () => {
    if (!searchEmail.trim()) {
      alert('Please enter an email address to search');
      return;
    }
    
    // In a real app, you'd make an API call here
    // For now, we'll search in localStorage
    const storedApplications = localStorage.getItem('jobApplications');
    if (storedApplications) {
      const allApplications = JSON.parse(storedApplications);
      const userApplications = allApplications.filter(app => 
        app.gmail.toLowerCase() === searchEmail.toLowerCase()
      );
      setApplications(userApplications);
    }
  };

  const handleEdit = (application) => {
    setSelectedApplication(application);
    setShowEditForm(true);
  };

  const handleDelete = (applicationId) => {
    if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      const updatedApplications = applications.filter(app => app.id !== applicationId);
      setApplications(updatedApplications);
      
      // Update localStorage
      const storedApplications = localStorage.getItem('jobApplications');
      if (storedApplications) {
        const allApplications = JSON.parse(storedApplications);
        const filteredApplications = allApplications.filter(app => app.id !== applicationId);
        localStorage.setItem('jobApplications', JSON.stringify(filteredApplications));
      }
      
      alert('Application deleted successfully');
    }
  };

  const handleUpdateApplication = (updatedApplication) => {
    const updatedApplications = applications.map(app => 
      app.id === updatedApplication.id ? updatedApplication : app
    );
    setApplications(updatedApplications);
    
    // Update localStorage
    const storedApplications = localStorage.getItem('jobApplications');
    if (storedApplications) {
      const allApplications = JSON.parse(storedApplications);
      const updatedAllApplications = allApplications.map(app => 
        app.id === updatedApplication.id ? updatedApplication : app
      );
      localStorage.setItem('jobApplications', JSON.stringify(updatedAllApplications));
    }
    
    setShowEditForm(false);
    setSelectedApplication(null);
    alert('Application updated successfully');
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedApplication(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="applicant-dashboard">
      <div className="dashboard-header">
        <h1>My Applications Dashboard</h1>
        <p>View and manage your job applications</p>
      </div>

      <div className="search-section">
        <div className="search-box">
          <input
            type="email"
            placeholder="Enter your email address to view applications"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <button onClick={handleSearch} className="search-btn">
            Search Applications
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="no-applications">
          <i className="bx bx-file-blank"></i>
          <h3>No Applications Found</h3>
          <p>Enter your email address above to search for your applications, or apply for a job first.</p>
        </div>
      ) : (
        <div className="applications-list">
          <h2>Your Applications ({applications.length})</h2>
          {applications.map((application) => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <h3>{application.position}</h3>
                <span className={`status status-${application.status}`}>
                  {application.status}
                </span>
              </div>
              
              <div className="application-details">
                <div className="detail-row">
                  <span className="label">Department:</span>
                  <span>{application.department}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Applied:</span>
                  <span>{new Date(application.appliedAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Experience:</span>
                  <span>{application.experience}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Education:</span>
                  <span>{application.education}</span>
                </div>
              </div>

              <div className="application-actions">
                <button 
                  onClick={() => handleEdit(application)}
                  className="edit-btn"
                >
                  <i className="bx bx-edit"></i> Edit
                </button>
                <button 
                  onClick={() => handleDelete(application.id)}
                  className="delete-btn"
                >
                  <i className="bx bx-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditForm && selectedApplication && (
        <EditApplicationForm
          application={selectedApplication}
          onSubmit={handleUpdateApplication}
          onClose={handleCloseEditForm}
        />
      )}
    </div>
  );
};

export default ApplicantDashboard;
