import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './ApplicantDashboard.css';
import EditApplicationForm from './EditApplicationForm';
import NavBar from '../NavBar/navBar';
import { useAuth } from '../../AuthGuard/AuthGuard';

const API_BASE_URL = 'http://localhost:5001';

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Lazy-load jsPDF from CDN when needed
  const loadJsPDF = async () => {
    if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
    return window.jspdf.jsPDF;
  };

  const downloadApplicationPDF = async (application) => {
    try {
      const JS = await loadJsPDF();
      const doc = new JS({ unit: 'pt', format: 'a4' });

      const margin = 40;
      let y = margin;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margin * 2;

      // Header: Brand title and timestamp
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Klassy Shirts - My Application', pageWidth / 2, y, { align: 'center' });
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleString()}` , pageWidth / 2, y, { align: 'center' });
      y += 14;
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 16;

      const skillsText = Array.isArray(application.skills)
        ? application.skills.join(', ')
        : (application.skills || '');

      const fields = [
        ['ID', application._id || application.id || ''],
        ['Name', application.name || ''],
        ['Email', application.gmail || ''],
        ['Phone', application.phone || ''],
        ['Age', application.age || ''],
        ['Address', application.address || ''],
        ['Applied At', application.appliedAt ? new Date(application.appliedAt).toLocaleString() : ''],
        ['Status', application.status || ''],
        ['Position', application.position || ''],
        ['Department', application.department || ''],
        ['Experience', application.experience || ''],
        ['Education', application.education || ''],
        ['Skills', skillsText],
        ['Cover Letter', application.coverLetter || ''],
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      fields.forEach(([key, val]) => {
        const label = `${key}: `;
        const text = String(val ?? '');
        const labelWidth = doc.getTextWidth(label);
        const lines = doc.splitTextToSize(text, contentWidth - labelWidth);

        if (y > doc.internal.pageSize.getHeight() - margin - 40) {
          doc.addPage();
          y = margin;
        }

        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        if (Array.isArray(lines)) {
          doc.text(lines, margin + labelWidth, y);
          y += (lines.length * 16);
        } else {
          doc.text(String(lines), margin + labelWidth, y);
          y += 16;
        }
      });

      const filename = `my_application_${(application._id || application.id || 'details')}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
      setError('Failed to generate PDF. Please try again.');
    }
  };

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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!currentUser?.id) return;
        const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}/notifications`);
        const data = await res.json();
        if (data?.status === 'ok' && Array.isArray(data.notifications)) {
          const unread = data.notifications.filter(n => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (e) {
        // ignore silently in dashboard
      }
    };
    fetchNotifications();
  }, [currentUser]);

  // Helper to fetch applications by email (server-first, fallback to local storage)
  const fetchApplicationsByEmail = async (email) => {
    if (!email || !email.trim()) {
      setError('');
      setApplications([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/applicant?gmail=${encodeURIComponent(email)}`);
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
          app.gmail && app.gmail.toLowerCase() === email.toLowerCase()
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

  // Auto-load the logged-in applicant's applications
  useEffect(() => {
    const email = currentUser?.email;
    if (email) {
      setSearchEmail(email);
      fetchApplicationsByEmail(email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.email]);

  // Auto-dismiss success messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setError('Please enter an email address to search');
      return;
    }
    setError(null); // Clear any previous errors
    setSuccess(''); // Clear any previous success messages
    fetchApplicationsByEmail(searchEmail);
  };

  const handleEdit = (application, index) => {
    // Prevent editing once application is approved
    if ((application.status || '').toLowerCase() === 'approved') {
      setError('You cannot edit an application after it has been approved.');
      setSuccess('');
      return;
    }
    setSelectedApplication(application);
    setSelectedIndex(index);
    setShowEditForm(true);
  };

  const handleNavigateEdit = (direction) => {
    if (!showEditForm || selectedIndex === null) {
      return;
    }

    const newIndex = selectedIndex + direction;
    if (newIndex < 0 || newIndex >= applications.length) {
      return;
    }

    setSelectedIndex(newIndex);
    setSelectedApplication(applications[newIndex]);
  };

  const handleDelete = (applicationId) => {
    // Find target application to check status
    const target = applications.find(app => (app._id || app.id) === applicationId);
    if (target && (target.status || '').toLowerCase() === 'approved') {
      setError('You cannot delete an application after it has been approved.');
      setSuccess('');
      return;
    }
    if (window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      const currentSelectedId =
        selectedIndex !== null && applications[selectedIndex]
          ? applications[selectedIndex]._id || applications[selectedIndex].id
          : null;

      const updatedApplications = applications.filter(
        (app) => (app._id || app.id) !== applicationId
      );
      setApplications(updatedApplications);

      // Update localStorage
      const storedApplications = localStorage.getItem('jobApplications');
      if (storedApplications) {
        const allApplications = JSON.parse(storedApplications);
        const filteredApplications = allApplications.filter(
          (app) => (app._id || app.id) !== applicationId
        );
        localStorage.setItem('jobApplications', JSON.stringify(filteredApplications));
      }

      if (showEditForm && selectedIndex !== null) {
        if (!updatedApplications.length) {
          setShowEditForm(false);
          setSelectedApplication(null);
          setSelectedIndex(null);
        } else if (currentSelectedId === applicationId) {
          const newIndex = Math.min(selectedIndex, updatedApplications.length - 1);
          setSelectedIndex(newIndex);
          setSelectedApplication(updatedApplications[newIndex]);
        } else {
          const refreshedIndex = updatedApplications.findIndex(
            (app) => (app._id || app.id) === currentSelectedId
          );

          if (refreshedIndex === -1) {
            setShowEditForm(false);
            setSelectedApplication(null);
            setSelectedIndex(null);
          } else {
            setSelectedIndex(refreshedIndex);
            setSelectedApplication(updatedApplications[refreshedIndex]);
          }
        }
      }

      setError(null); // Clear any previous errors
      setSuccess('Application deleted successfully');
    }
  };

  const handleUpdateApplication = async (updatedApplication) => {
    const targetId = (selectedApplication && (selectedApplication._id || selectedApplication.id)) || updatedApplication._id || updatedApplication.id;

    try {
      setError(null);
      setSuccess('');
      // Build a minimal diff payload of only changed fields
      const original = selectedApplication || {};
      const payload = {};
      const keys = [
        'name','gmail','age','address','phone','position','department','experience','education','skills','coverLetter','status'
      ];
      keys.forEach((k) => {
        if (updatedApplication[k] === undefined) return;
        const newVal = typeof updatedApplication[k] === 'string' ? updatedApplication[k].trim() : updatedApplication[k];
        const oldValRaw = original[k];
        const oldVal = typeof oldValRaw === 'string' ? oldValRaw.trim() : oldValRaw;
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          payload[k] = newVal;
        }
      });

      // If no changes detected, just close and show success
      if (Object.keys(payload).length === 0) {
        setShowEditForm(false);
        setSelectedApplication(null);
        setSelectedIndex(null);
        setSuccess('No changes to update');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/applicant/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson?.message || 'Failed to update application';
        throw new Error(msg);
      }

      const data = await res.json();
      console.debug('Update application response:', data);
      const saved = data?.data || updatedApplication;

      const updatedApplications = applications.map((app) => {
        const appId = app._id || app.id;
        const savedId = saved._id || saved.id || targetId;
        return appId === savedId ? saved : app;
      });
      setApplications(updatedApplications);

      // Update localStorage (best-effort cache)
      const storedApplications = localStorage.getItem('jobApplications');
      if (storedApplications) {
        const allApplications = JSON.parse(storedApplications);
        const savedId = saved._id || saved.id || targetId;
        const updatedAllApplications = allApplications.map((app) => {
          const appId = app._id || app.id;
          return appId === savedId ? saved : app;
        });
        localStorage.setItem('jobApplications', JSON.stringify(updatedAllApplications));
      }

      if (selectedIndex !== null) {
        const refreshed = updatedApplications[selectedIndex];
        if (refreshed) {
          setSelectedApplication(refreshed);
        }
      }

      setShowEditForm(false);
      setSelectedApplication(null);
      setSelectedIndex(null);

      // Re-fetch from server to confirm DB persistence and sync UI
      const emailToFetch = searchEmail || currentUser?.email || saved.gmail;
      if (emailToFetch) {
        await fetchApplicationsByEmail(emailToFetch);
      }

      setSuccess('Application updated successfully');
    } catch (e) {
      console.error('Failed to update application:', e);
      setError(e.message || 'Failed to update application');
    }
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedApplication(null);
    setSelectedIndex(null);
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
        <div className="dashboard-header-actions">
          <button
            type="button"
            className="header-nav-btn secondary"
            onClick={() => navigate(-1)}
          >
            <i className="bx bx-arrow-back"></i> Back
          </button>
          <button
            type="button"
            className="header-nav-btn secondary"
            onClick={() => navigate('/user/account')}
          >
            Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
          </button>
          <button
            type="button"
            className="header-nav-btn primary"
            onClick={() => navigate('/career')}
          >
            Next Opportunities <i className="bx bx-arrow-forward"></i>
          </button>
        </div>
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
        
        {success && (
          <div className="success-message">
            {success}
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
              {applications.map((application, index) => {
                const cardKey = application._id || application.id;
                const statusKey = (application.status || 'pending')
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-');
                const statusLabel = formatStatusLabel(statusKey);
                const appliedDate = new Date(application.appliedAt || Date.now()).toLocaleDateString();
                const skills = Array.isArray(application.skills)
                  ? application.skills.join(', ')
                  : application.skills;
                const isApproved = (application.status || '').toLowerCase() === 'approved';

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
                        onClick={() => handleEdit(application, index)}
                        className="edit-btn"
                        disabled={isApproved}
                        title={isApproved ? 'Editing is disabled after approval' : 'Edit this application'}
                      >
                        <i className="bx bx-edit"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(application._id || application.id)}
                        className="delete-btn"
                        disabled={isApproved}
                        title={isApproved ? 'Deletion is disabled after approval' : 'Delete this application'}
                      >
                        <i className="bx bx-trash"></i> Delete
                      </button>
                      <button
                        onClick={() => downloadApplicationPDF(application)}
                        className="download-btn"
                        title="Download a PDF copy of this application"
                      >
                        <i className="bx bxs-file-pdf"></i> Download PDF
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
            onPrev={() => handleNavigateEdit(-1)}
            onNext={() => handleNavigateEdit(1)}
            hasPrev={selectedIndex !== null && selectedIndex > 0}
            hasNext={selectedIndex !== null && selectedIndex < applications.length - 1}
          />
        )}
      </div>
    </div>
  );
};

export default ApplicantDashboard;
