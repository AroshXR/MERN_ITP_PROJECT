import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Reports.css';

const API_BASE_URL = 'http://localhost:5001';

export default function Reports() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportStatus, setReportStatus] = useState('all');
  const [reportGenerating, setReportGenerating] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE_URL}/applicant/analytics`);
      setAnalytics(res.data?.data || null);
    } catch (e) {
      console.error('Analytics fetch error:', e);
      if (e.code === 'ECONNREFUSED' || e.message.includes('Network Error')) {
        setError('Backend server is not running. Please start the server and try again.');
      } else if (e.response?.status === 404) {
        setError('Analytics endpoint not found. Please check the backend routes.');
      } else {
        setError(`Failed to load analytics: ${e.response?.data?.message || e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const downloadReport = () => {
    if (!analytics) {
      alert('No analytics data available. Please refresh the page and try again.');
      return;
    }
    
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        summary: analytics.summary,
        applicantsByPosition: analytics.applicantsByPosition,
        interviewSchedules: analytics.interviewSchedules,
        pendingApplications: analytics.pendingApplications
      };
      
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recruitment-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const downloadCSV = () => {
    if (!analytics) {
      alert('No analytics data available. Please refresh the page and try again.');
      return;
    }
    
    try {
      const csvData = [
        ['Name', 'Email', 'Position', 'Status', 'Applied At', 'Resume File'],
        ...analytics.pendingApplications.map(app => [
          app.name,
          app.email,
          app.position,
          'pending',
          new Date(app.appliedAt).toLocaleDateString(),
          app.resume?.filename || 'N/A'
        ])
      ];
      
      const csvContent = csvData.map(row => 
        row.map(value => {
          const str = value ?? '';
          const escaped = String(str).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(',')
      ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pending-applications-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Failed to download CSV report. Please try again.');
    }
  };

  const downloadApplicantReport = async (format = 'json') => {
    try {
      setReportGenerating(true);
      setError('');
      
      const response = await axios.get(`${API_BASE_URL}/applicant/reports`, {
        params: { status: reportStatus },
        timeout: 10000 // 10 second timeout
      });
      
      const applicants = response.data?.data || [];
      if (applicants.length === 0) {
        alert('No applicants found for the selected status.');
        return;
      }

      const fileLabel = reportStatus === 'all' ? 'all' : reportStatus;

      if (format === 'json') {
        const payload = {
          generatedAt: new Date().toISOString(),
          status: reportStatus,
          totalApplicants: applicants.length,
          applicants
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `applicants-${fileLabel}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      const header = ['Name', 'Email', 'Position', 'Department', 'Status', 'Applied At', 'Resume File'];
      const rows = applicants.map((applicant) => [
        applicant.name,
        applicant.email,
        applicant.position,
        applicant.department,
        applicant.status,
        applicant.appliedAt ? new Date(applicant.appliedAt).toLocaleDateString() : '',
        applicant.resume?.filename || 'N/A'
      ]);

      const csvRows = [header, ...rows].map((row) =>
        row
          .map((value) => {
            const str = value ?? '';
            const escaped = String(str).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      );

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `applicants-${fileLabel}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Applicant report download error:', e);
      let errorMessage = 'Failed to generate applicant report. ';
      
      if (e.code === 'ECONNREFUSED' || e.message.includes('Network Error')) {
        errorMessage += 'Backend server is not running. Please start the server and try again.';
      } else if (e.response?.status === 404) {
        errorMessage += 'Reports endpoint not found. Please check the backend routes.';
      } else if (e.response?.status === 500) {
        errorMessage += 'Server error occurred while generating the report.';
      } else if (e.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please try again.';
      } else {
        errorMessage += e.response?.data?.message || e.message;
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setReportGenerating(false);
    }
  };

  if (loading) return <div className="reports-loading">Loading analytics...</div>;
  if (error) return (
    <div className="reports-error">
      <p>{error}</p>
      <button onClick={fetchAnalytics} className="btn btn--primary">Retry</button>
    </div>
  );
  if (!analytics) return <div className="reports-error">No data available</div>;

  return (
    <div className="reports">
      <div className="reports__header">
        <h2>Recruitment Reports</h2>
        <div className="reports__actions">
          <button onClick={downloadReport} className="btn btn--primary">Download JSON Report</button>
          <button onClick={downloadCSV} className="btn btn--secondary">Download CSV</button>
          <button onClick={fetchAnalytics} className="btn btn--ghost">Refresh</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="reports__summary">
        <div className="summary-card">
          <h3>Total Applicants</h3>
          <div className="summary-number">{analytics.summary.totalApplicants}</div>
        </div>
        <div className="summary-card">
          <h3>Pending</h3>
          <div className="summary-number">{analytics.summary.pending}</div>
        </div>
        <div className="summary-card">
          <h3>Approved</h3>
          <div className="summary-number">{analytics.summary.approved}</div>
        </div>
        <div className="summary-card">
          <h3>Rejected</h3>
          <div className="summary-number">{analytics.summary.rejected}</div>
        </div>
        <div className="summary-card">
          <h3>Shortlisted Ratio</h3>
          <div className="summary-number">{analytics.summary.shortlistedRatio}</div>
        </div>
        <div className="summary-card">
          <h3>Rejected Ratio</h3>
          <div className="summary-number">{analytics.summary.rejectedRatio}</div>
        </div>
      </div>

      {/* Applicant Reports */}
      <div className="reports__section">
        <h3>Download Applicant Reports</h3>
        <div className="report-filter">
          <label htmlFor="report-status">Status</label>
          <select
            id="report-status"
            value={reportStatus}
            onChange={(event) => setReportStatus(event.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="reports__actions">
          <button
            onClick={() => downloadApplicantReport('json')}
            className="btn btn--primary"
            disabled={reportGenerating}
          >
            {reportGenerating ? 'Preparing...' : 'Download JSON'}
          </button>
          <button
            onClick={() => downloadApplicantReport('csv')}
            className="btn btn--secondary"
            disabled={reportGenerating}
          >
            {reportGenerating ? 'Preparing...' : 'Download CSV'}
          </button>
        </div>
      </div>

      {/* Applicants by Position */}
      <div className="reports__section">
        <h3>Applicants by Position</h3>
        <div className="position-table">
          <div className="position-table__head">
            <div>Position</div>
            <div>Total</div>
            <div>Pending</div>
            <div>Approved</div>
            <div>Rejected</div>
          </div>
          {Object.entries(analytics.applicantsByPosition).map(([position, data]) => (
            <div key={position} className="position-table__row">
              <div>{position}</div>
              <div>{data.total}</div>
              <div>{data.pending}</div>
              <div>{data.approved}</div>
              <div>{data.rejected}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interview Schedules */}
      <div className="reports__section">
        <h3>Interview Schedules</h3>
        {analytics.interviewSchedules.length === 0 ? (
          <p>No interviews scheduled</p>
        ) : (
          <div className="interview-table">
            <div className="interview-table__head">
              <div>Name</div>
              <div>Position</div>
              <div>Date & Time</div>
              <div>Mode</div>
              <div>Location/Link</div>
            </div>
            {analytics.interviewSchedules.map((interview) => (
              <div key={interview.id} className="interview-table__row">
                <div>{interview.name}</div>
                <div>{interview.position}</div>
                <div>{new Date(interview.scheduledAt).toLocaleString()}</div>
                <div>{interview.mode}</div>
                <div>
                  {interview.meetingLink ? (
                    <a href={interview.meetingLink} target="_blank" rel="noreferrer">Join Meeting</a>
                  ) : (
                    interview.location || '-'
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Applications */}
      <div className="reports__section">
        <h3>Pending Applications</h3>
        {analytics.pendingApplications.length === 0 ? (
          <p>No pending applications</p>
        ) : (
          <div className="pending-table">
            <div className="pending-table__head">
              <div>Name</div>
              <div>Email</div>
              <div>Position</div>
              <div>Applied Date</div>
              <div>Resume</div>
            </div>
            {analytics.pendingApplications.map((app) => (
              <div key={app.id} className="pending-table__row">
                <div>{app.name}</div>
                <div>{app.email}</div>
                <div>{app.position}</div>
                <div>{new Date(app.appliedAt).toLocaleDateString()}</div>
                <div>
                  {app.resume?.filename ? (
                    <a 
                      href={`${API_BASE_URL}/uploads/resumes/${app.resume.filename}`} 
                      target="_blank" 
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
