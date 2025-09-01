import React, { useState, useEffect } from 'react';
import './AdminJobManagement.css';

const AdminJobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
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
    salary: { min: '', max: '', currency: 'USD' },
    deadline: ''
  });

  useEffect(() => {
    // Load jobs from localStorage for demo
    const storedJobs = localStorage.getItem('adminJobs');
    if (storedJobs) {
      setJobs(JSON.parse(storedJobs));
    }
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const jobData = {
      id: editingJob ? editingJob.id : Date.now().toString(),
      ...formData,
      status: 'active',
      postedAt: editingJob ? editingJob.postedAt : new Date().toISOString(),
      postedBy: 'admin'
    };

    if (editingJob) {
      // Update existing job
      const updatedJobs = jobs.map(job => 
        job.id === editingJob.id ? jobData : job
      );
      setJobs(updatedJobs);
      localStorage.setItem('adminJobs', JSON.stringify(updatedJobs));
    } else {
      // Add new job
      const newJobs = [...jobs, jobData];
      setJobs(newJobs);
      localStorage.setItem('adminJobs', JSON.stringify(newJobs));
    }

    setShowJobForm(false);
    setEditingJob(null);
    resetForm();
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
      requirements: job.requirements || [''],
      responsibilities: job.responsibilities || [''],
      benefits: job.benefits || [''],
      salary: job.salary || { min: '', max: '', currency: 'USD' },
      deadline: job.deadline || ''
    });
    setShowJobForm(true);
  };

  const handleDelete = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      setJobs(updatedJobs);
      localStorage.setItem('adminJobs', JSON.stringify(updatedJobs));
    }
  };

  const handleStatusChange = (jobId, newStatus) => {
    const updatedJobs = jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    );
    setJobs(updatedJobs);
    localStorage.setItem('adminJobs', JSON.stringify(updatedJobs));
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
      salary: { min: '', max: '', currency: 'USD' },
      deadline: ''
    });
  };

  const closeForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
    resetForm();
  };

  return (
    <div className="admin-job-management">
      <div className="admin-header">
        <h1>Job Management Dashboard</h1>
        <p>Post and manage job openings</p>
        <button 
          className="add-job-btn"
          onClick={() => setShowJobForm(true)}
        >
          <i className="bx bx-plus"></i> Post New Job
        </button>
      </div>

      <div className="jobs-list">
        <h2>Current Jobs ({jobs.length})</h2>
        {jobs.length === 0 ? (
          <div className="no-jobs">
            <i className="bx bx-briefcase"></i>
            <h3>No Jobs Posted</h3>
            <p>Start by posting your first job opening</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job.id} className="job-card">
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
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
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
                    onClick={() => handleDelete(job.id)}
                    className="delete-btn"
                  >
                    <i className="bx bx-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
  );
};

export default AdminJobManagement;
