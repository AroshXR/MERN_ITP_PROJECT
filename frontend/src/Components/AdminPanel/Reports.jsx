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

  // Helpers for visuals
  const ratioToNumber = (ratioStr) => {
    if (!ratioStr) return 0;
    const n = parseFloat(String(ratioStr).replace('%', ''));
    return isNaN(n) ? 0 : Math.max(0, Math.min(100, n));
  };

  const getPositionSegments = (data) => {
    const total = data?.total || 0;
    if (total <= 0) return { pending: 0, approved: 0, rejected: 0 };
    return {
      pending: Math.round((data.pending || 0) / total * 100),
      approved: Math.round((data.approved || 0) / total * 100),
      rejected: Math.round((data.rejected || 0) / total * 100)
    };
  };

  const downloadReport = () => {
    if (!analytics) {
      alert('No analytics data available. Please refresh the page and try again.');
      return;
    }
    
    try {
      const reportData = {
        title: 'Klassy T Shirts',
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
      const headerTitle = ['Klassy T Shirts'];
      const section = ['Pending Applicants'];
      const blank = [''];
      const csvData = [
        headerTitle,
        section,
        blank,
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

  const downloadAnalyticsPDF = () => {
    if (!analytics) {
      alert('No analytics data available. Please refresh the page and try again.');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get the current report data
    const reportData = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Klassy T Shirts - Recruitment Analytics Report</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    line-height: 1.6;
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 20px;
                }
                .header h1 { 
                    color: #1e40af; 
                    margin: 0; 
                    font-size: 2.2em;
                }
                .header h2 { 
                    color: #64748b; 
                    margin: 5px 0; 
                    font-weight: normal;
                }
                .report-info { 
                    background: #f8fafc; 
                    padding: 15px; 
                    border-radius: 8px; 
                    margin-bottom: 25px; 
                    border-left: 4px solid #2563eb;
                }
                .summary-section {
                    margin-bottom: 20px;
                }
                .summary-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                .summary-table th, .summary-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                .summary-table th {
                    background-color: #2563eb;
                    color: white;
                }
                .position-table, .interview-table, .pending-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    font-size: 11px;
                }
                .position-table th, .position-table td,
                .interview-table th, .interview-table td,
                .pending-table th, .pending-table td {
                    border: 1px solid #ddd;
                    padding: 6px;
                    text-align: left;
                }
                .position-table th, .interview-table th, .pending-table th {
                    background-color: #1e40af;
                    color: white;
                }
                .status-pending { color: #d97706; font-weight: bold; }
                .status-approved { color: #059669; font-weight: bold; }
                .status-rejected { color: #dc2626; font-weight: bold; }
                .footer { 
                    margin-top: 30px; 
                    padding-top: 20px; 
                    border-top: 2px solid #e2e8f0; 
                    text-align: center; 
                    color: #64748b; 
                    font-size: 0.9em;
                }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>KLASSY T SHIRTS</h1>
                <h2>Career Management System</h2>
                <h3>RECRUITMENT ANALYTICS REPORT</h3>
            </div>
            
            <div class="report-info">
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                <p><strong>Report Type:</strong> Recruitment Analytics</p>
                <p><strong>Total Applicants:</strong> ${analytics.summary.totalApplicants}</p>
            </div>
            
            <div class="summary-section">
                <h3>Summary Statistics</h3>
                <table class="summary-table">
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Percentage</th>
                    </tr>
                    <tr>
                        <td>Total Applicants</td>
                        <td>${analytics.summary.totalApplicants}</td>
                        <td>100%</td>
                    </tr>
                    <tr>
                        <td>Pending Applications</td>
                        <td>${analytics.summary.pending}</td>
                        <td>${analytics.summary.pendingRatio || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Approved Applications</td>
                        <td>${analytics.summary.approved}</td>
                        <td>${analytics.summary.shortlistedRatio || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Rejected Applications</td>
                        <td>${analytics.summary.rejected}</td>
                        <td>${analytics.summary.rejectedRatio || 'N/A'}</td>
                    </tr>
                </table>
            </div>
            
            <div class="summary-section">
                <h3>Applicants by Position</h3>
                <table class="position-table">
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Total</th>
                            <th>Pending</th>
                            <th>Approved</th>
                            <th>Rejected</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(analytics.applicantsByPosition).map(([position, data]) => `
                            <tr>
                                <td>${position}</td>
                                <td>${data.total}</td>
                                <td class="status-pending">${data.pending}</td>
                                <td class="status-approved">${data.approved}</td>
                                <td class="status-rejected">${data.rejected}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            ${analytics.interviewSchedules.length > 0 ? `
            <div class="summary-section">
                <h3>Interview Schedules</h3>
                <table class="interview-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Position</th>
                            <th>Date & Time</th>
                            <th>Mode</th>
                            <th>Location/Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${analytics.interviewSchedules.map(interview => `
                            <tr>
                                <td>${interview.name}</td>
                                <td>${interview.position}</td>
                                <td>${new Date(interview.scheduledAt).toLocaleString()}</td>
                                <td>${interview.mode}</td>
                                <td>${interview.meetingLink ? 'Online Meeting' : (interview.location || 'N/A')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}
            
            <div class="summary-section">
                <h3>Pending Applications</h3>
                <table class="pending-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Position</th>
                            <th>Applied Date</th>
                            <th>Resume File</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${analytics.pendingApplications.map(app => `
                            <tr>
                                <td>${app.name}</td>
                                <td>${app.email}</td>
                                <td>${app.position}</td>
                                <td>${new Date(app.appliedAt).toLocaleDateString()}</td>
                                <td>${app.resume?.filename || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="footer">
                <p><strong>Report Summary:</strong></p>
                <p>Total Data Points Analyzed: ${analytics.summary.totalApplicants} | Generated: ${new Date().toISOString()}</p>
                <p><strong>Disclaimer:</strong> This report contains confidential business information.</p>
                <p>© 2025 Klassy T Shirts - All Rights Reserved</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(reportData);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
        printWindow.print();
    };
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
      const sectionLabel = (status => {
        switch (status) {
          case 'approved': return 'Approved Applicants';
          case 'rejected': return 'Rejected Applicants';
          case 'pending': return 'Pending Applicants';
          default: return 'Applicant Details';
        }
      })(reportStatus);

      if (format === 'json') {
        const payload = {
          title: 'Klassy T Shirts',
          section: sectionLabel,
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

      if (format === 'pdf') {
        downloadApplicantReportAsPDF(applicants, sectionLabel, fileLabel);
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

      const csvRows = [
        ['Klassy T Shirts'],
        [sectionLabel],
        [''],
        header,
        ...rows
      ].map((row) =>
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

  const downloadApplicantReportAsPDF = (applicants, sectionLabel, fileLabel) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Get the current report data
    const reportData = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Klassy T Shirts - ${sectionLabel} Report</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    line-height: 1.6;
                    color: #333;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 20px;
                }
                .header h1 { 
                    color: #1e40af; 
                    margin: 0; 
                    font-size: 2.2em;
                }
                .header h2 { 
                    color: #64748b; 
                    margin: 5px 0; 
                    font-weight: normal;
                }
                .report-info { 
                    background: #f8fafc; 
                    padding: 15px; 
                    border-radius: 8px; 
                    margin-bottom: 25px; 
                    border-left: 4px solid #2563eb;
                }
                .summary-section {
                    margin-bottom: 20px;
                }
                .summary-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                .summary-table th, .summary-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                .summary-table th {
                    background-color: #2563eb;
                    color: white;
                }
                .applicant-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    font-size: 11px;
                }
                .applicant-table th, .applicant-table td {
                    border: 1px solid #ddd;
                    padding: 6px;
                    text-align: left;
                }
                .applicant-table th {
                    background-color: #1e40af;
                    color: white;
                }
                .status-pending { color: #d97706; font-weight: bold; }
                .status-approved { color: #059669; font-weight: bold; }
                .status-rejected { color: #dc2626; font-weight: bold; }
                .footer { 
                    margin-top: 30px; 
                    padding-top: 20px; 
                    border-top: 2px solid #e2e8f0; 
                    text-align: center; 
                    color: #64748b; 
                    font-size: 0.9em;
                }
                @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>KLASSY T SHIRTS</h1>
                <h2>Career Management System</h2>
                <h3>${sectionLabel.toUpperCase()} REPORT</h3>
            </div>
            
            <div class="report-info">
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
                <p><strong>Report Type:</strong> ${sectionLabel}</p>
                <p><strong>Total Applicants:</strong> ${applicants.length}</p>
            </div>
            
            <div class="summary-section">
                <h3>Summary Statistics</h3>
                <table class="summary-table">
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                    <tr>
                        <td>Total Applicants</td>
                        <td>${applicants.length}</td>
                    </tr>
                    <tr>
                        <td>Pending Applications</td>
                        <td>${applicants.filter(a => a.status === 'pending').length}</td>
                    </tr>
                    <tr>
                        <td>Approved Applications</td>
                        <td>${applicants.filter(a => a.status === 'approved').length}</td>
                    </tr>
                    <tr>
                        <td>Rejected Applications</td>
                        <td>${applicants.filter(a => a.status === 'rejected').length}</td>
                    </tr>
                    <tr>
                        <td>Unique Positions</td>
                        <td>${[...new Set(applicants.map(a => a.position))].length}</td>
                    </tr>
                </table>
            </div>
            
            <div class="summary-section">
                <h3>Applicant Details</h3>
                <table class="applicant-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Position</th>
                            <th>Department</th>
                            <th>Status</th>
                            <th>Applied Date</th>
                            <th>Resume File</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${applicants.map(applicant => `
                            <tr>
                                <td>${applicant.name}</td>
                                <td>${applicant.email}</td>
                                <td>${applicant.position}</td>
                                <td>${applicant.department || 'N/A'}</td>
                                <td class="status-${applicant.status}">${applicant.status.toUpperCase()}</td>
                                <td>${applicant.appliedAt ? new Date(applicant.appliedAt).toLocaleDateString() : 'N/A'}</td>
                                <td>${applicant.resume?.filename || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="footer">
                <p><strong>Report Summary:</strong></p>
                <p>Total Data Points Analyzed: ${applicants.length} | Generated: ${new Date().toISOString()}</p>
                <p><strong>Disclaimer:</strong> This report contains confidential business information.</p>
                <p>© 2025 Klassy T Shirts - All Rights Reserved</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(reportData);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
        printWindow.print();
    };
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
        <p className="reports__subtitle">Insights and exports for your hiring pipeline</p>
        <div className="reports__actions">
          <button onClick={downloadReport} className="btn btn--primary">Download JSON Report</button>
          <button onClick={downloadCSV} className="btn btn--secondary">Download CSV</button>
          <button onClick={downloadAnalyticsPDF} className="btn btn--secondary" title="Download PDF report for printing and sharing">📄 Download PDF</button>
          <button onClick={fetchAnalytics} className="btn btn--ghost">Refresh</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="reports__summary">
        <div className="summary-card">
          <div className="summary-card__icon total"><i className="bx bx-user-pin"></i></div>
          <h3>Total Applicants</h3>
          <div className="summary-number">{analytics.summary.totalApplicants}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon pending"><i className="bx bx-time-five"></i></div>
          <h3>Pending</h3>
          <div className="summary-number">{analytics.summary.pending}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon approved"><i className="bx bx-check-circle"></i></div>
          <h3>Approved</h3>
          <div className="summary-number">{analytics.summary.approved}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__icon rejected"><i className="bx bx-block"></i></div>
          <h3>Rejected</h3>
          <div className="summary-number">{analytics.summary.rejected}</div>
        </div>
        <div className="summary-card">
          <h3>Shortlisted Ratio</h3>
          <div className="summary-number">{analytics.summary.shortlistedRatio}</div>
          <div className="progress">
            <div
              className="progress__bar approved"
              style={{ width: `${ratioToNumber(analytics.summary.shortlistedRatio)}%` }}
            />
          </div>
        </div>
        <div className="summary-card">
          <h3>Rejected Ratio</h3>
          <div className="summary-number">{analytics.summary.rejectedRatio}</div>
          <div className="progress">
            <div
              className="progress__bar rejected"
              style={{ width: `${ratioToNumber(analytics.summary.rejectedRatio)}%` }}
            />
          </div>
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
          <button
            onClick={() => downloadApplicantReport('pdf')}
            className="btn btn--secondary"
            disabled={reportGenerating}
            title="Download PDF report for printing and sharing"
          >
            {reportGenerating ? 'Preparing...' : '📄 Download PDF'}
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
            <div>Breakdown</div>
            <div>Pending</div>
            <div>Approved</div>
            <div>Rejected</div>
          </div>
          {Object.entries(analytics.applicantsByPosition).map(([position, data]) => {
            const seg = getPositionSegments(data);
            return (
              <div key={position} className="position-table__row">
                <div>{position}</div>
                <div>{data.total}</div>
                <div>
                  <div className="position-bar" title={`Pending ${seg.pending}%, Approved ${seg.approved}%, Rejected ${seg.rejected}%`}>
                    <span className="position-bar__segment pending" style={{ width: `${seg.pending}%` }} />
                    <span className="position-bar__segment approved" style={{ width: `${seg.approved}%` }} />
                    <span className="position-bar__segment rejected" style={{ width: `${seg.rejected}%` }} />
                  </div>
                </div>
                <div><span className="pill pill--pending">{data.pending}</span></div>
                <div><span className="pill pill--approved">{data.approved}</span></div>
                <div><span className="pill pill--rejected">{data.rejected}</span></div>
              </div>
            );
          })}
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
