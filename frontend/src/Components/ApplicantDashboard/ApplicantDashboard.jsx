import React, { useState, useEffect, useMemo } from 'react';
import './ApplicantDashboard.css';
import EditApplicationForm from './EditApplicationForm';
import NavBar from '../NavBar/navBar';

const API_BASE_URL = 'http://localhost:5001';

const ApplicantDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');

  const statusSummary = useMemo(() => {
    if (!applications.length) {
      return { total: 0, statuses: [] };
    }

    const counts = applications.reduce((acc, application) => {
      const key = (application.status || 'pending')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const statuses = Object.entries(counts)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    return { total: applications.length, statuses };
  }, [applications]);

  const formatStatusLabel = (status) =>
    status
      .split(/[-_]/g)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  useEffect(() => {
    // Load any locally stored applications first as a baseline
    const storedApplications = localStorage.getItem('jobApplications');
    if (storedApplications) {
      setApplications(JSON.parse(storedApplications));
    }
    setLoading(false);
  }, []);

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      alert('Please enter an email address to search');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/applicant?gmail=${encodeURIComponent(searchEmail)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : [];
      setApplications(list);
    } catch (e) {
      // Fallback to local search
      const storedApplications = localStorage.getItem('jobApplications');
      if (storedApplications) {
        const allApplications = JSON.parse(storedApplications);
        const userApplications = allApplications.filter((app) =>
          app.gmail && app.gmail.toLowerCase() === searchEmail.toLowerCase()
        );
        setApplications(userApplications);
        setError('Showing locally saved applications (server unavailable)');
      } else {
        setApplications([]);
        setError('No applications found and server unavailable');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (application) => {
    setSelectedApplication(application);
    setShowEditForm(true);
  };

  const handleDelete = (applicationId) => {
    if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      const updatedApplications = applications.filter((app) => app.id !== applicationId);
      setApplications(updatedApplications);

      // Update localStorage
      const storedApplications = localStorage.getItem('jobApplications');
      if (storedApplications) {
        const allApplications = JSON.parse(storedApplications);
        const filteredApplications = allApplications.filter((app) => app.id !== applicationId);
        localStorage.setItem('jobApplications', JSON.stringify(filteredApplications));
      }

      alert('Application deleted successfully');
    }
  };

  const handleUpdateApplication = (updatedApplication) => {
    const updatedApplications = applications.map((app) =>
      app.id === updatedApplication.id ? updatedApplication : app
    );
    setApplications(updatedApplications);

    // Update localStorage
    const storedApplications = localStorage.getItem('jobApplications');
    if (storedApplications) {
      const allApplications = JSON.parse(storedApplications);
      const updatedAllApplications = allApplications.map((app) =>
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
    <div className="main">
      <NavBar />
      <div className="dashboard-header">
        <h1>My Applications Dashboard</h1>
        <p>View and manage your job applications</p>
      </div>
      <div className="applicant-dashboard">
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
            <div className="applications-list__header">
              <h2>Your Applications ({applications.length})</h2>
              <p>Stay on top of every role you've applied for and track their progress at a glance.</p>
            </div>

            {statusSummary.statuses.length > 0 && (
              <div className="applications-stats">
                <div className="stat-card total">
                  <span className="stat-label">Total Applications</span>
                  <span className="stat-value">{statusSummary.total}</span>
                </div>
                {statusSummary.statuses.map(({ status, count }) => (
                  <div key={status} className={`stat-card status-${status}`}>
                    <span className="stat-label">{formatStatusLabel(status)}</span>
                    <span className="stat-value">{count}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="applications-grid">
              {applications.map((application) => {
                const cardKey = application._id || application.id;
                const statusKey = (application.status || 'pending')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-');
                const statusLabel = formatStatusLabel(statusKey);
                const appliedDate = new Date(application.appliedAt || Date.now()).toLocaleDateString();
                const skills = Array.isArray(application.skills)
                  ? application.skills.join(', ')
                  : application.skills;

                return (
                  <div key={cardKey} className="application-card">
                    <div className="card-accent" aria-hidden="true"></div>
                    <div className="application-header">
                      <h3>{application.position}</h3>
                      <span className={`status status-${statusKey}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="application-meta">
                      <span className="meta-chip">
                        <i className="bx bx-calendar"></i>
                        {appliedDate}
                      </span>
                      <span className="meta-chip">
                        <i className="bx bx-buildings"></i>
                        {application.department}
                      </span>
                      {application.gmail && (
                        <span className="meta-chip">
                          <i className="bx bx-envelope"></i>
                          {application.gmail}
                        </span>
                      )}
                    </div>

                    <div className="application-details">
                      <div className="detail-row">
                        <span className="label">Experience</span>
                        <span>{application.experience}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Education</span>
                        <span>{application.education}</span>
                      </div>
                      {skills && (
                        <div className="detail-row">
                          <span className="label">Key Skills</span>
                          <span>{skills}</span>
                        </div>
                      )}
                    </div>

                    <div className="application-actions">
                      <button
                        onClick={() => handleEdit(application)}
                        className="edit-btn"
                      >
                        <i className="bx bx-edit"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(application._id || application.id)}
                        className="delete-btn"
                      >
                        <i className="bx bx-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
    </div>
  );
};

export default ApplicantDashboard;
