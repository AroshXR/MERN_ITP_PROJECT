import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Career.css';
import ApplicantForm from './ApplicantForm';
import NavBar from '../NavBar/navBar';

const Career = () => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobOpenings, setJobOpenings] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = 'http://localhost:5001';

  // Load jobs from backend API when component mounts
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      if (response.data.data && response.data.data.length > 0) {
        setAllJobs(response.data.data);
        setJobOpenings(response.data.data);
      } else {
        setAllJobs([]);
        setJobOpenings([]);
      }
    } catch (err) {
      console.error('Error fetching jobs from API:', err);
      setError('Failed to fetch jobs from server. Please try again.');

      // Fallback to localStorage if API fails
      const storedJobs = localStorage.getItem('adminJobs');
      if (storedJobs) {
        const parsedJobs = JSON.parse(storedJobs);
        // Filter only active jobs
        const activeJobs = parsedJobs.filter(job => job.status === 'active');
        setAllJobs(activeJobs);
        setJobOpenings(activeJobs);
      } else {
        setAllJobs([]);
        setJobOpenings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const applySearch = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setJobOpenings(allJobs);
      return;
    }
    const filtered = allJobs.filter(job => {
      const hay = [job.title, job.department, job.location, job.type, job.description]
        .filter(Boolean)
        .join(' ') // combine
        .toLowerCase();
      const reqs = Array.isArray(job.requirements) ? job.requirements.join(' ').toLowerCase() : '';
      return hay.includes(q) || reqs.includes(q);
    });
    setJobOpenings(filtered);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applySearch();
    }
  };

  const handleApplyNow = (job) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
  };

  const handleCloseForm = () => {
    setShowApplicationForm(false);
    setSelectedJob(null);
  };

  const handleApplicationSubmit = async (formData) => {
    try {
      // Send application to backend API
      const response = await axios.post(`${API_BASE_URL}/applicant`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.message) {
        alert('Thank you for your application! We will review it and get back to you soon.');
        handleCloseForm();
      }
    } catch (error) {
      console.error('Error submitting application:', error);

      // If backend responded, show its error and do NOT fallback
      if (error.response) {
        const msg = error.response.data?.message || 'Submission failed.';
        const errs = error.response.data?.errors;
        alert(errs && Array.isArray(errs) ? `${msg}\n- ${errs.join('\n- ')}` : msg);
        return;
      }

      // Network error: fallback to localStorage
      try {
        const applicationData = {
          id: Date.now().toString(),
          ...Object.fromEntries(formData),
          appliedAt: new Date().toISOString(),
          status: 'pending'
        };

        const existingApplications = localStorage.getItem('jobApplications') || '[]';
        const applications = JSON.parse(existingApplications);
        applications.push(applicationData);
        localStorage.setItem('jobApplications', JSON.stringify(applications));

        alert('Application saved locally (API unavailable). Please check your backend connection.');
        handleCloseForm();
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        alert('There was an error submitting your application. Please try again.');
      }
    }
  };

  return (
    <div className='main'>
      <NavBar />
      <div className="career-header">
        <h1>Join Our Team</h1>
        <p>Be part of our mission to create amazing fashion experiences</p>
      </div>
      <div className="career-page">


        <div className="career-content">
          <div className="career-intro">
            <h2>Why Work With Us?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <i className="bx bx-heart"></i>
                <h3>Passion for Fashion</h3>
                <p>Work in an environment where creativity and innovation are celebrated</p>
              </div>
              <div className="benefit-card">
                <i className="bx bx-trending-up"></i>
                <h3>Growth Opportunities</h3>
                <p>Continuous learning and career development programs</p>
              </div>
              <div className="benefit-card">
                <i className="bx bx-group"></i>
                <h3>Great Team</h3>
                <p>Collaborate with talented professionals in a supportive environment</p>
              </div>
              <div className="benefit-card">
                <i className="bx bx-gift"></i>
                <h3>Benefits & Perks</h3>
                <p>Competitive salary, health insurance, and flexible work arrangements</p>
              </div>
            </div>
          </div>

          <div className="job-openings">
            <h2>Current Openings</h2>
            <div className="job-search">
              <input
                type="text"
                className="job-search-input"
                placeholder="Search by title, department, location, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <button className="job-search-btn" onClick={applySearch}>
                Search
              </button>
            </div>
            {loading ? (
              <div className="loading-message">
                <p>Loading job openings...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>{error}</p>
              </div>
            ) : jobOpenings.length === 0 ? (
              <div className="no-jobs-message">
                <div className="no-jobs-icon">📋</div>
                <h3>No Job Openings Available</h3>
                <p>Currently, there are no active job openings. Please check back later or contact us to learn about future opportunities.</p>
                <p>Administrators can post new job openings through the Manage Jobs section.</p>
              </div>
            ) : (
              <div className="jobs-grid">
                {jobOpenings.map((job) => (
                  <div key={job._id || job.id} className="job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <span className="job-type">{job.type}</span>
                    </div>
                    <div className="job-details">
                      <p><i className="bx bx-building"></i> {job.department}</p>
                      <p><i className="bx bx-map"></i> {job.location}</p>
                      <p><i className="bx bx-time"></i> {job.experience}</p>
                      {job.salary && (job.salary.min !== undefined || job.salary.max !== undefined) && (
                        <p>
                          <i className="bx bx-money"></i>{' '}
                          {job.salary.currency || 'LKR'}{' '}
                          {job.salary.min !== undefined ? job.salary.min : '-'}
                          {' - '}
                          {job.salary.max !== undefined ? job.salary.max : '-'}
                        </p>
                      )}
                      {job.deadline && (
                        <p>
                          <i className="bx bx-calendar"></i>{' '}
                          Apply before: {new Date(job.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <p className="job-description">{job.description}</p>
                    <div className="job-requirements">
                      <h4>Key Requirements:</h4>
                      <ul>
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <button
                      className="apply-btn"
                      onClick={() => handleApplyNow(job)}
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="career-cta">
            <h2>Don't See the Right Fit?</h2>
            <p>We're always looking for talented individuals to join our team. Send us your resume and we'll keep you in mind for future opportunities.</p>
            <button
              className="general-apply-btn"
              onClick={() => handleApplyNow({ title: "General Application", department: "Various" })}
            >
              Submit General Application
            </button>
          </div>
        </div>

        {showApplicationForm && (
          <ApplicantForm
            job={selectedJob}
            onSubmit={handleApplicationSubmit}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </div>
  );
};

export default Career;
