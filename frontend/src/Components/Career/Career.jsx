import React, { useState, useEffect } from 'react';
import './Career.css';
import ApplicantForm from './ApplicantForm';

const Career = () => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const jobOpenings = [
    {
      id: 1,
      title: "Fashion Designer",
      department: "Design",
      location: "Colombo, Sri Lanka",
      type: "Full-time",
      experience: "2-5 years",
      description: "We are looking for a creative Fashion Designer to join our team. You will be responsible for creating innovative designs, following fashion trends, and working closely with our production team.",
      requirements: [
        "Bachelor's degree in Fashion Design or related field",
        "Proficiency in design software (Adobe Creative Suite, CAD)",
        "Strong understanding of fashion trends and market demands",
        "Excellent sketching and illustration skills",
        "Ability to work in a fast-paced environment"
      ],
      responsibilities: [
        "Create original designs for clothing collections",
        "Research fashion trends and market demands",
        "Collaborate with production team for sample development",
        "Attend fashion shows and industry events",
        "Maintain design documentation and specifications"
      ]
    },
    {
      id: 2,
      title: "Production Manager",
      department: "Operations",
      location: "Colombo, Sri Lanka",
      type: "Full-time",
      experience: "3-7 years",
      description: "We are seeking an experienced Production Manager to oversee our manufacturing operations and ensure efficient production processes.",
      requirements: [
        "Bachelor's degree in Business, Engineering, or related field",
        "Minimum 3 years of experience in production management",
        "Strong knowledge of manufacturing processes",
        "Excellent leadership and communication skills",
        "Proficiency in production planning software"
      ],
      responsibilities: [
        "Oversee daily production operations",
        "Develop and implement production schedules",
        "Monitor quality control processes",
        "Manage production team and resources",
        "Optimize production efficiency and costs"
      ]
    },
    {
      id: 3,
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Colombo, Sri Lanka",
      type: "Full-time",
      experience: "1-3 years",
      description: "Join our marketing team to help promote our brand and products through various digital and traditional marketing channels.",
      requirements: [
        "Bachelor's degree in Marketing, Business, or related field",
        "Experience in digital marketing and social media",
        "Strong analytical and creative thinking skills",
        "Excellent written and verbal communication",
        "Knowledge of marketing tools and platforms"
      ],
      responsibilities: [
        "Develop and execute marketing campaigns",
        "Manage social media presence and content",
        "Analyze market trends and competitor activities",
        "Coordinate with design and sales teams",
        "Track and report marketing performance metrics"
      ]
    },
    {
      id: 4,
      title: "Sales Representative",
      department: "Sales",
      location: "Colombo, Sri Lanka",
      type: "Full-time",
      experience: "1-3 years",
      description: "We are looking for motivated Sales Representatives to help expand our customer base and drive revenue growth.",
      requirements: [
        "Bachelor's degree in Business, Sales, or related field",
        "Strong interpersonal and communication skills",
        "Ability to build and maintain customer relationships",
        "Goal-oriented and self-motivated",
        "Willingness to travel for client meetings"
      ],
      responsibilities: [
        "Identify and prospect new customers",
        "Present products and services to clients",
        "Negotiate contracts and pricing",
        "Maintain customer relationships",
        "Achieve sales targets and goals"
      ]
    }
  ];

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
      // Store application in localStorage for demo purposes
      // In a real app, you'd send this to your backend API
      const applicationData = {
        id: Date.now().toString(),
        ...Object.fromEntries(formData),
        appliedAt: new Date().toISOString(),
        status: 'pending'
      };
      
      // Store in localStorage
      const existingApplications = localStorage.getItem('jobApplications') || '[]';
      const applications = JSON.parse(existingApplications);
      applications.push(applicationData);
      localStorage.setItem('jobApplications', JSON.stringify(applications));
      
      alert('Thank you for your application! We will review it and get back to you soon.');
      handleCloseForm();
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again.');
    }
  };

  return (
    <div className="career-page">
      <div className="career-header">
        <h1>Join Our Team</h1>
        <p>Be part of our mission to create amazing fashion experiences</p>
      </div>

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
          <div className="jobs-grid">
            {jobOpenings.map((job) => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <span className="job-type">{job.type}</span>
                </div>
                <div className="job-details">
                  <p><i className="bx bx-building"></i> {job.department}</p>
                  <p><i className="bx bx-map"></i> {job.location}</p>
                  <p><i className="bx bx-time"></i> {job.experience}</p>
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
  );
};

export default Career;
