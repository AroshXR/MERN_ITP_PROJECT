import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './AdminApplicantManagement.css';

const API_BASE_URL = 'http://localhost:5001';

export default function AdminApplicantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const fetchApplicant = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE_URL}/applicant/${id}`);
      setApplicant(res.data?.data || null);
    } catch (e) {
      console.error('Failed to load applicant:', e);
      setError('Failed to load applicant');
      setFeedback({
        type: 'error',
        message: 'Unable to load applicant. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!applicant?.gmail) return;
    try {
      setNotificationsLoading(true);
      // Find the user by email to get their notifications
      const userRes = await axios.get(`${API_BASE_URL}/users`);
      const users = userRes.data?.data || [];
      const user = users.find(u => u.email === applicant.gmail && u.type === 'Applicant');
      
      if (user) {
        const notifRes = await axios.get(`${API_BASE_URL}/users/${user._id}/notifications`);
        if (notifRes.data?.status === 'ok') {
          const list = Array.isArray(notifRes.data.notifications) ? notifRes.data.notifications : [];
          list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setNotifications(list);
        }
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => { 
    fetchApplicant(); 
    /* eslint-disable-next-line */ 
  }, [id]);

  useEffect(() => {
    if (applicant?.gmail) {
      fetchNotifications();
    }
  }, [applicant?.gmail]);

  const onApproveReject = async (status) => {
    try {
      setFeedback(null);
      const trimmedMessage = statusMessage.trim();
      await axios.patch(`${API_BASE_URL}/applicant/${id}/status`, { status, statusMessage });
      await fetchApplicant();
      setStatusMessage('');
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
      setFeedback({
        type: 'success',
        message: `${statusLabel} status saved.${trimmedMessage ? ' Your note was delivered as part of the notification.' : ''} The applicant now sees this in their account notifications.`
      });
    } catch (e) {
      console.error('Failed to update applicant status:', e);
      setFeedback({
        type: 'error',
        message: 'Failed to update status. Please try again.'
      });
    }
  };


  const resumeUrl = applicant?.resume?.filename ? `${API_BASE_URL}/uploads/resumes/${applicant.resume.filename}` : '';

  return (
    <div className="admin-applicants detail">
      <div className="admin-applicants__header">
        <h2>Applicant Details</h2>
        <div className="header-nav-actions">
          <button
            type="button"
            className="header-nav-btn secondary"
            onClick={() => navigate(-1)}
          >
            <i className="bx bx-arrow-back"></i> Back
          </button>
          <button
            type="button"
            className="header-nav-btn primary"
            onClick={() => navigate('/admin-jobs')}
          >
            Next <i className="bx bx-arrow-forward"></i>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`admin-applicants__feedback ${feedback.type}`}>
          <span>{feedback.message}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss message"
          >
            <i className="bx bx-x"></i>
          </button>
        </div>
      )}

      {loading && <div className="admin-applicants__info">Loading...</div>}
      {error && <div className="admin-applicants__error">{error}</div>}
      {!loading && applicant && (
        <div className="detail__grid">
          <div className="detail__card">
            <h3>Profile</h3>
            <div className="detail__row"><span>Name</span><b>{applicant.name}</b></div>
            <div className="detail__row"><span>Email</span><b>{applicant.gmail}</b></div>
            <div className="detail__row"><span>Phone</span><b>{applicant.phone || '-'}</b></div>
            <div className="detail__row"><span>Age</span><b>{applicant.age}</b></div>
            <div className="detail__row"><span>Address</span><b>{applicant.address}</b></div>
            <div className="detail__row"><span>Applied At</span><b>{new Date(applicant.appliedAt).toLocaleString()}</b></div>
            <div className="detail__row"><span>Status</span><b>{applicant.status}</b></div>
          </div>

          <div className="detail__card">
            <h3>Application</h3>
            <div className="detail__row"><span>Position</span><b>{applicant.position}</b></div>
            <div className="detail__row"><span>Department</span><b>{applicant.department}</b></div>
            <div className="detail__row"><span>Experience</span><b>{applicant.experience}</b></div>
            <div className="detail__row"><span>Education</span><b>{applicant.education}</b></div>
            <div className="detail__row"><span>Skills</span><b>{applicant.skills}</b></div>
            <div className="detail__row column"><span>Cover Letter</span><p>{applicant.coverLetter}</p></div>
            <div className="detail__row"><span>Resume</span>{resumeUrl ? <a href={resumeUrl} target="_blank" rel="noreferrer" className="btn">Download</a> : <b>-</b>}</div>
          </div>

          <div className="detail__card">
            <h3>Actions</h3>
            <label>Message to applicant</label>
            <input type="text" value={statusMessage} onChange={(e) => setStatusMessage(e.target.value)} placeholder="Optional message" />
            <div className="actions">
              <button className="btn btn--approve" onClick={() => onApproveReject('approved')}>Approve</button>
              <button className="btn btn--reject" onClick={() => onApproveReject('rejected')}>Reject</button>
            </div>
          </div>

          <div className="detail__card">
            <h3>Interview</h3>
            {applicant.interview?.scheduledAt && (
              <div className="detail__row"><span>Scheduled</span><b>{new Date(applicant.interview.scheduledAt).toLocaleString()}</b></div>
            )}
            {applicant.interview?.mode && (
              <div className="detail__row"><span>Mode</span><b>{applicant.interview.mode}</b></div>
            )}
            {applicant.interview?.location && (
              <div className="detail__row"><span>Location</span><b>{applicant.interview.location}</b></div>
            )}
            {applicant.interview?.meetingLink && (
              <div className="detail__row"><span>Link</span><a href={applicant.interview.meetingLink} target="_blank" rel="noreferrer">Open</a></div>
            )}
            {applicant.interview?.notes && (
              <div className="detail__row column"><span>Notes</span><p>{applicant.interview.notes}</p></div>
            )}
            <button className="btn" onClick={() => navigate('/admin-applicants')}>Back to Management</button>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      <div className="detail__card">
        <div className="detail__row">
          <h3>Applicant Notifications</h3>
          <button 
            className="btn btn--ghost" 
            onClick={fetchNotifications}
            disabled={notificationsLoading}
          >
            {notificationsLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {notificationsLoading ? (
          <p>Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="empty-state">No notifications yet.</p>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div key={notification._id} className={`notification-item ${notification.read ? 'read' : 'unread'}`}>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <small className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </div>
                <div className="notification-level">
                  <span className={`level-badge ${notification.level}`}>
                    {notification.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


