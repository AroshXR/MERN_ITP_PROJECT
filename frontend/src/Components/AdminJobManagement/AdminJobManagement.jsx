import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AdminJobManagement.css';
import { useNavigate } from 'react-router-dom';

const AdminJobManagement = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    experience: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    benefits: [''],
    salary: { min: '', max: '', currency: 'LKR' },
    deadline: ''
  });

  const API_BASE_URL = 'http://localhost:5001';

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((job) => {
      const fields = [
        job.title,
        job.department,
        job.location,
        job.type,
        job.experience,
        job.description,
        job.status,
      ];
      return fields
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [jobs, searchQuery]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const downloadApplicantReport = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/applicant/reports`);
      const rows = res.data?.data || [];
      if (!rows.length) {
        alert('No applicant data to download');
        return;
      }
      const titleRow = ['Klassy T Shirts'];
      const sectionRow = ['Applicant Details'];
      const blankRow = [''];
      const headers = ['ID','Name','Email','Position','Department','Status','Applied At'];

      const csvRows = [
        titleRow,
        sectionRow,
        blankRow,
        headers,
        ...rows.map(r => [
          r.id,
          r.name || '',
          r.email || '',
          r.position || '',
          r.department || '',
          r.status || '',
          r.appliedAt ? new Date(r.appliedAt).toLocaleString() : ''
        ])
      ];

      const csv = csvRows
        .map(row => row.map(val => {
          const str = val ?? '';
          const escaped = String(str).replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `applicant_report_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to download report:', e);
      alert('Failed to download applicant report');
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/jobs/admin/all`);
      setJobs(response.data.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch jobs. Please try again.');
      // Fallback to localStorage if API fails
      const storedJobs = localStorage.getItem('adminJobs');
      if (storedJobs) {
        setJobs(JSON.parse(storedJobs));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSalaryChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        [field]: field === 'currency' ? value : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      // Ensure numeric min/max for backend validation
      const salaryData = {
        min: formData.salary?.min === '' ? null : Number(formData.salary.min),
        max: formData.salary?.max === '' ? null : Number(formData.salary.max),
        currency: formData.salary?.currency || 'LKR'
      };

      // Frontend validation for salary
      if (salaryData.min == null || isNaN(salaryData.min)) {
        setLoading(false);
        setError('Minimum salary is required');
        return;
      }
      if (salaryData.max == null || isNaN(salaryData.max)) {
        setLoading(false);
        setError('Maximum salary is required');
        return;
      }
      if (salaryData.min < 0 || salaryData.max < 0) {
        setLoading(false);
        setError('Salary values cannot be negative');
        return;
      }
      if (salaryData.max < salaryData.min) {
        setLoading(false);
        setError('Maximum salary must be greater than or equal to minimum salary');
        return;
      }

      const jobData = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        experience: formData.experience,
        description: formData.description,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        responsibilities: formData.responsibilities.filter(resp => resp.trim() !== ''),
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
        salary: salaryData,
        deadline: formData.deadline,
        status: 'active'
      };

      if (editingJob) {
        // Update existing job
        const response = await axios.put(`${API_BASE_URL}/jobs/${editingJob._id}`, jobData);
        if (response.data.message) {
          await fetchJobs(); // Refresh the jobs list
          alert('Job updated successfully!');
        }
      } else {
        // Create new job
        const response = await axios.post(`${API_BASE_URL}/jobs`, jobData);
        if (response.data.message) {
          await fetchJobs(); // Refresh the jobs list
          alert('Job posted successfully!');
        }
      }

      setShowJobForm(false);
      setEditingJob(null);
      resetForm();
    } catch (err) {
      console.error('Error saving job:', err);
      setError(err.response?.data?.message || 'Failed to save job. Please try again.');

      // Fallback to localStorage if API fails
      const fallbackJobData = {
        id: editingJob ? editingJob.id : Date.now().toString(),
        ...formData,
        status: 'active',
        postedAt: editingJob ? editingJob.postedAt : new Date().toISOString(),
        postedBy: 'admin'
      };

      if (editingJob) {
        const updatedJobs = jobs.map(job =>
          job.id === editingJob.id ? fallbackJobData : job
        );
        setJobs(updatedJobs);
        localStorage.setItem('adminJobs', JSON.stringify(updatedJobs));
      } else {
        const newJobs = [...jobs, fallbackJobData];
        setJobs(newJobs);
        localStorage.setItem('adminJobs', JSON.stringify(newJobs));
      }

      alert('Job saved to local storage (API unavailable). Please check your backend connection.');
      setShowJobForm(false);
      setEditingJob(null);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      department: job.department || '',
      location: job.location || '',
      type: job.type || 'Full-time',
      experience: job.experience || '',
      description: job.description || '',
      requirements: job.requirements && job.requirements.length > 0 ? job.requirements : [''],
      responsibilities: job.responsibilities && job.responsibilities.length > 0 ? job.responsibilities : [''],
      benefits: job.benefits && job.benefits.length > 0 ? job.benefits : [''],
      salary: job.salary || { min: '', max: '', currency: 'LKR' },
      deadline: job.deadline || ''
    });
    setShowJobForm(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        setLoading(true);
        setError('');

        const response = await axios.delete(`${API_BASE_URL}/jobs/${jobId}`);
        if (response.data.message) {
          await fetchJobs(); // Refresh the jobs list
          alert('Job deleted successfully!');
        }
      } catch (err) {
        console.error('Error deleting job:', err);
        setError(err.response?.data?.message || 'Failed to delete job. Please try again.');

        // Fallback to localStorage if API fails
        const updatedJobs = jobs.filter(job => job.id !== jobId && job._id !== jobId);
        setJobs(updatedJobs);
        localStorage.setItem('adminJobs', JSON.stringify(updatedJobs));
        alert('Job deleted from local storage (API unavailable). Please check your backend connection.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.patch(`${API_BASE_URL}/jobs/${jobId}/status`, { status: newStatus });
      if (response.data.message) {
        await fetchJobs(); // Refresh the jobs list
      }
    } catch (err) {
      console.error('Error updating job status:', err);
      setError(err.response?.data?.message || 'Failed to update job status. Please try again.');

      // Fallback to localStorage if API fails
      const updatedJobs = jobs.map(job =>
        (job.id === jobId || job._id === jobId) ? { ...job, status: newStatus } : job
      );
      setJobs(updatedJobs);
      localStorage.setItem('adminJobs', JSON.stringify(updatedJobs));
      alert('Job status updated in local storage (API unavailable). Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      location: '',
      type: 'Full-time',
      experience: '',
      description: '',
      requirements: [''],
      responsibilities: [''],
      benefits: [''],
      salary: { min: '', max: '', currency: 'LKR' },
      deadline: ''
    });
  };

  const closeForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
    resetForm();
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Job Management</h1>
        <p>Post and manage job openings</p>
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
            onClick={() => navigate('/admin-applicants')}
          >
            Next <i className="bx bx-arrow-forward"></i>
          </button>
        </div>
      </div>
      <div className='main'>
        <div className="admin-job-management">

          <div className="jobs-list">
            <h2>
              Current Jobs ({filteredJobs.length}{searchQuery ? ` / ${jobs.length}` : ''})
            </h2>
            <div className="jobs-toolbar">
              <div className="search-input-wrapper">
                <i className="bx bx-search job-search-icon"></i>
                <input
                  type="text"
                  className="job-search-input"
                  placeholder="Search by title, department, location, type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {loading ? (
              <div className="loading-message">Loading jobs...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : jobs.length === 0 ? (
              <div className="no-jobs">
                <i className="bx bx-briefcase"></i>
                <h3>No Jobs Posted</h3>
                <p>Start by posting your first job opening</p>
              </div>
            ) : (
              <div className="jobs-grid">
                {filteredJobs.map((job) => (
                  <div key={job._id || job.id} className="job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <span className={`status status-${job.status}`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="job-details">
                      <p><i className="bx bx-building"></i> {job.department}</p>
                      <p><i className="bx bx-map"></i> {job.location}</p>
                      <p><i className="bx bx-time"></i> {job.type}</p>
                      <p><i className="bx bx-calendar"></i> {job.experience}</p>
                    </div>

                    <p className="job-description">{job.description}</p>

                    <div className="job-actions">
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job._id || job.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="closed">Closed</option>
                      </select>

                      <button
                        onClick={() => handleEdit(job)}
                        className="edit-btn"
                      >
                        <i className="bx bx-edit"></i> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(job._id || job.id)}
                        className="delete-btn"
                      >
                        <i className="bx bx-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <button className="add-job-btn" onClick={() => { setShowJobForm(true); }}>
                <i className="bx bx-plus"></i> Post New Job
              </button>
            </div>
          </div>

          {showJobForm && (
            <div className="job-form-overlay">
              <div className="job-form-modal">
                <div className="form-header">
                  <h2>{editingJob ? 'Edit Job' : 'Post New Job'}</h2>
                  <button className="close-btn" onClick={closeForm}>
                    <i className="bx bx-x"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="job-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="title">Job Title *</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="department">Department *</label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="location">Location *</label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="type">Job Type *</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">Experience Required *</label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g., 2-5 years"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Job Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="salaryMin">Minimum Salary *</label>
                      <input
                        type="number"
                        id="salaryMin"
                        name="salaryMin"
                        value={formData.salary.min}
                        onChange={(e) => handleSalaryChange('min', Number(e.target.value))}
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="salaryMax">Maximum Salary *</label>
                      <input
                        type="number"
                        id="salaryMax"
                        name="salaryMax"
                        value={formData.salary.max}
                        onChange={(e) => handleSalaryChange('max', Number(e.target.value))}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="currency">Currency</label>
                      <select
                        id="currency"
                        name="currency"
                        value={formData.salary.currency}
                        onChange={(e) => handleSalaryChange('currency', e.target.value)}
                      >
                        <option value="LKR">LKR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="INR">INR</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="deadline">Application Deadline</label>
                      <input
                        type="date"
                        id="deadline"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Requirements</label>
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="array-input">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                          placeholder="Enter requirement"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('requirements', index)}
                          className="remove-btn"
                        >
                          <i className="bx bx-minus"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('requirements')}
                      className="add-btn"
                    >
                      <i className="bx bx-plus"></i> Add Requirement
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Responsibilities</label>
                    {formData.responsibilities.map((resp, index) => (
                      <div key={index} className="array-input">
                        <input
                          type="text"
                          value={resp}
                          onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                          placeholder="Enter responsibility"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem('responsibilities', index)}
                          className="remove-btn"
                        >
                          <i className="bx bx-minus"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem('responsibilities')}
                      className="add-btn"
                    >
                      <i className="bx bx-plus"></i> Add Responsibility
                    </button>
                  </div>

                  <div className="form-actions">
                    <button type="button" onClick={closeForm} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      {editingJob ? 'Update Job' : 'Post Job'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export default AdminJobManagement;
