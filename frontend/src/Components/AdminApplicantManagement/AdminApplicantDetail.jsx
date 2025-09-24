import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './AdminApplicantManagement.css';

const API_BASE_URL = 'http://localhost:5001';

export default function AdminApplicantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [interviewForm, setInterviewForm] = useState({ open: false, scheduledAt: '', mode: 'in-person', location: '', meetingLink: '', notes: '' });

  const fetchApplicant = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE_URL}/applicant/${id}`);
      setApplicant(res.data?.data || null);
      const iv = res.data?.data?.interview || {};
      setInterviewForm(prev => ({
        ...prev,
        scheduledAt: iv.scheduledAt ? new Date(iv.scheduledAt).toISOString().slice(0, 16) : '',
        mode: iv.mode || 'in-person',
        location: iv.location || '',
        meetingLink: iv.meetingLink || '',
        notes: iv.notes || ''
      }));
    } catch (e) {
      setError('Failed to load applicant');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplicant(); /* eslint-disable-next-line */ }, [id]);

  const onApproveReject = async (status) => {
    try {
      await axios.patch(`${API_BASE_URL}/applicant/${id}/status`, { status, statusMessage });
      await fetchApplicant();
      setStatusMessage('');
      alert(`Applicant ${status}`);
    } catch (e) {
      alert('Failed to update status');
    }
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
      await axios.post(`${API_BASE_URL}/applicant/${id}/schedule-interview`, payload);
      setInterviewForm(prev => ({ ...prev, open: false }));
      await fetchApplicant();
      alert('Interview scheduled');
    } catch (e) {
      alert('Failed to schedule interview');
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
            <button className="btn" onClick={() => setInterviewForm(prev => ({ ...prev, open: true }))}>Schedule / Edit</button>
          </div>
        </div>
      )}

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


