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

  const downloadApplicantPDF = async () => {
    if (!applicant) return;
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
      doc.text('Klassy Shirts - Applicant Details', pageWidth / 2, y, { align: 'center' });
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
      y += 14;
      // Divider line
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 16;

      const fields = [
        ['ID', applicant._id || applicant.id || ''],
        ['Name', applicant.name || ''],
        ['Email', applicant.gmail || ''],
        ['Phone', applicant.phone || ''],
        ['Age', applicant.age || ''],
        ['Address', applicant.address || ''],
        ['Applied At', applicant.appliedAt ? new Date(applicant.appliedAt).toLocaleString() : ''],
        ['Status', applicant.status || ''],
        ['Position', applicant.position || ''],
        ['Department', applicant.department || ''],
        ['Experience', applicant.experience || ''],
        ['Education', applicant.education || ''],
        ['Skills', Array.isArray(applicant.skills) ? applicant.skills.join(', ') : (applicant.skills || '')],
        ['Cover Letter', applicant.coverLetter || ''],
        ['Resume File', applicant?.resume?.filename || ''],
        ['Interview Scheduled', applicant?.interview?.scheduledAt ? new Date(applicant.interview.scheduledAt).toLocaleString() : ''],
        ['Interview Mode', applicant?.interview?.mode || ''],
        ['Interview Location', applicant?.interview?.location || ''],
        ['Interview Link', applicant?.interview?.meetingLink || ''],
        ['Interview Notes', applicant?.interview?.notes || ''],
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
          // Draw value starting after label
          doc.text(lines, margin + labelWidth, y);
          y += (lines.length * 16);
        } else {
          doc.text(String(lines), margin + labelWidth, y);
          y += 16;
        }
      });

      const filename = `applicant_${(applicant._id || applicant.id || 'details')}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
      alert('Failed to generate PDF. Please check your network connection and try again.');
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

  // Optional real-time updates via Socket.IO with polling fallback
  useEffect(() => {
    let cleanup = () => {};
    let pollTimer = null;

    const setup = async () => {
      try {
        const mod = await import('socket.io-client');
        const io = mod.io || mod.default;
        if (!io) throw new Error('socket.io-client not available');
        const socket = io(API_BASE_URL, { transports: ['websocket'], reconnection: true });

        const onChange = (payload) => {
          if (!payload || !payload.id || payload.id === id) {
            fetchApplicant();
          }
        };

        socket.on('connect', () => {
          // connected
        });
        socket.on('applicant:updated', onChange);
        socket.on('applicant:status', onChange);
        socket.on('applicant:interview', onChange);

        cleanup = () => {
          try {
            socket.off('applicant:updated', onChange);
            socket.off('applicant:status', onChange);
            socket.off('applicant:interview', onChange);
            socket.disconnect();
          } catch (_) {}
        };
      } catch (e) {
        // Fallback polling every 15s if socket unavailable
        pollTimer = setInterval(() => {
          fetchApplicant();
        }, 15000);
        cleanup = () => pollTimer && clearInterval(pollTimer);
      }
    };

    setup();
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const downloadApplicantDetails = () => {
    if (!applicant) return;
    const entries = [
      ['ID', applicant._id || applicant.id || ''],
      ['Name', applicant.name || ''],
      ['Email', applicant.gmail || ''],
      ['Phone', applicant.phone || ''],
      ['Age', applicant.age || ''],
      ['Address', applicant.address || ''],
      ['Applied At', applicant.appliedAt ? new Date(applicant.appliedAt).toLocaleString() : ''],
      ['Status', applicant.status || ''],
      ['Position', applicant.position || ''],
      ['Department', applicant.department || ''],
      ['Experience', applicant.experience || ''],
      ['Education', applicant.education || ''],
      ['Skills', Array.isArray(applicant.skills) ? applicant.skills.join(', ') : (applicant.skills || '')],
      ['Cover Letter', applicant.coverLetter || ''],
      ['Resume File', applicant?.resume?.filename || ''],
      ['Interview Scheduled', applicant?.interview?.scheduledAt ? new Date(applicant.interview.scheduledAt).toLocaleString() : ''],
      ['Interview Mode', applicant?.interview?.mode || ''],
      ['Interview Location', applicant?.interview?.location || ''],
      ['Interview Link', applicant?.interview?.meetingLink || ''],
      ['Interview Notes', applicant?.interview?.notes || ''],
    ];

    const escape = (val) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}` + `"`;
    };

    const csv = entries.map(([k, v]) => `${escape(k)},${escape(v)}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applicant_${(applicant._id || applicant.id || 'details')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-applicants detail">
      <div className="admin-applicants__header">
        <h2>Klassy Shirts - Applicant Details</h2>
        {applicant && (
          <p className="admin-applicants__subtitle">
            {applicant.name || 'Applicant'}
            {applicant.position ? ` · ${applicant.position}` : ''}
          </p>
        )}
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
            <div className="detail__row"><span>Full Details</span>
              <div className="actions">
                <button className="btn btn--download" onClick={downloadApplicantDetails}>Download CSV</button>
                <button className="btn btn--pdf" onClick={downloadApplicantPDF}>Download PDF</button>
              </div>
            </div>
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
            <button className="btn btn--backto" onClick={() => navigate('/admin-applicants')}>Back to Management</button>
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


