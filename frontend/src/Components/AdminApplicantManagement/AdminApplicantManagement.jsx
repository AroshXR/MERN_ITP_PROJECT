import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminApplicantManagement.css';

const API_BASE_URL = 'http://localhost:5001';

export default function AdminApplicantManagement() {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [messageById, setMessageById] = useState({});
  const [interviewForm, setInterviewForm] = useState({ open: false, id: '', scheduledAt: '', mode: 'in-person', location: '', meetingLink: '', notes: '' });

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await axios.get(`${API_BASE_URL}/applicant`, { params });
      setApplicants(res.data?.data || []);
    } catch (e) {
      setError('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const onApproveReject = async (id, status) => {
    try {
      const statusMessage = messageById[id] || '';
      await axios.patch(`${API_BASE_URL}/applicant/${id}/status`, { status, statusMessage });
      await fetchApplicants();
      setMessageById(prev => ({ ...prev, [id]: '' }));
      alert(`Applicant ${status}`);
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const openInterview = (app) => {
    const initial = app?.interview || {};
    setInterviewForm({
      open: true,
      id: app._id,
      scheduledAt: initial.scheduledAt ? new Date(initial.scheduledAt).toISOString().slice(0, 16) : '',
      mode: initial.mode || 'in-person',
      location: initial.location || '',
      meetingLink: initial.meetingLink || '',
      notes: initial.notes || ''
    });
  };

  const submitInterview = async () => {
    try {
      const payload = {
        scheduledAt: interviewForm.scheduledAt ? new Date(interviewForm.scheduledAt).toISOString() : '',
        mode: interviewForm.mode,
        location: interviewForm.mode === 'in-person' ? interviewForm.location : undefined,
        meetingLink: interviewForm.mode === 'online' ? interviewForm.meetingLink : undefined,
        notes: interviewForm.notes || undefined
      };
      await axios.post(`${API_BASE_URL}/applicant/${interviewForm.id}/schedule-interview`, payload);
      setInterviewForm(prev => ({ ...prev, open: false }));
      await fetchApplicants();
      alert('Interview scheduled');
    } catch (e) {
      alert('Failed to schedule interview');
    }
  };

  const rows = useMemo(() => applicants, [applicants]);

  return (
    <div className="admin-applicants">
      <div className="admin-applicants__header">
        <h2>Applicant Management</h2>
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
        <div className="admin-applicants__filters">
          <label>Status:&nbsp;</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={fetchApplicants}>Refresh</button>
        </div>
      </div>

      {loading && <div className="admin-applicants__info">Loading...</div>}
      {error && <div className="admin-applicants__error">{error}</div>}

      <div className="admin-applicants__table">
          <div className="table__head">
          <div>Name</div>
          <div>Email</div>
          <div>Position</div>
          <div>Status</div>
          <div>Message</div>
          <div>Actions</div>
          <div>Interview</div>
        </div>
        {rows.map((a) => (
          <div className="table__row" key={a._id}>
            <div><a href={`/admin-applicants/${a._id}`}>{a.name}</a></div>
            <div>{a.gmail}</div>
            <div>{a.position}</div>
            <div>{a.status}</div>
            <div>
              <input
                type="text"
                placeholder="Status message"
                value={messageById[a._id] ?? ''}
                onChange={(e) => setMessageById(prev => ({ ...prev, [a._id]: e.target.value }))}
              />
            </div>
            <div className="actions">
              <button className="btn btn--approve" onClick={() => onApproveReject(a._id, 'approved')}>Approve</button>
              <button className="btn btn--reject" onClick={() => onApproveReject(a._id, 'rejected')}>Reject</button>
            </div>
            <div>
              <button className="btn" onClick={() => openInterview(a)}>Schedule</button>
              {a.interview?.scheduledAt && (
                <div className="interview-badge">
                  {new Date(a.interview.scheduledAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {interviewForm.open && (
        <div className="modal">
          <div className="modal__content">
            <div className="modal__header">
              <h3>Schedule Interview</h3>
              <button className="icon-btn" onClick={() => setInterviewForm(prev => ({ ...prev, open: false }))}>✕</button>
            </div>
            <div className="modal__body">
              <label>Date & Time</label>
              <input type="datetime-local" value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm(prev => ({ ...prev, scheduledAt: e.target.value }))} />
              <label>Mode</label>
              <select value={interviewForm.mode} onChange={(e) => setInterviewForm(prev => ({ ...prev, mode: e.target.value }))}>
                <option value="in-person">In person</option>
                <option value="online">Online</option>
              </select>
              {interviewForm.mode === 'in-person' && (
                <>
                  <label>Location</label>
                  <input type="text" value={interviewForm.location} onChange={(e) => setInterviewForm(prev => ({ ...prev, location: e.target.value }))} />
                </>
              )}
              {interviewForm.mode === 'online' && (
                <>
                  <label>Meeting Link</label>
                  <input type="text" value={interviewForm.meetingLink} onChange={(e) => setInterviewForm(prev => ({ ...prev, meetingLink: e.target.value }))} />
                </>
              )}
              <label>Notes</label>
              <textarea value={interviewForm.notes} onChange={(e) => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))} />
            </div>
            <div className="modal__footer">
              <button className="btn" onClick={submitInterview}>Save</button>
              <button className="btn btn--ghost" onClick={() => setInterviewForm(prev => ({ ...prev, open: false }))}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


