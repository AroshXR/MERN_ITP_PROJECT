import React, { useState } from 'react';
import './ApplicantForm.css';

const ApplicantForm = ({ job, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    gmail: '',
    age: '',
    address: '',
    phone: '',
    position: job?.title || '',
    department: job?.department || '',
    experience: '',
    education: '',
    skills: '',
    coverLetter: '',
    resume: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          resume: 'File size must be less than 5MB'
        }));
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          resume: 'Please upload a PDF or Word document'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
      
      if (errors.resume) {
        setErrors(prev => ({
          ...prev,
          resume: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.gmail.trim()) {
      newErrors.gmail = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.gmail)) {
      newErrors.gmail = 'Please enter a valid email address';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (formData.age < 16 || formData.age > 100) {
      newErrors.age = 'Age must be between 16 and 100 years';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters long';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    }

    if (!formData.education.trim()) {
      newErrors.education = 'Education is required';
    }

    if (!formData.skills.trim()) {
      newErrors.skills = 'Skills are required';
    }

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required';
    } else if (formData.coverLetter.trim().length < 100) {
      newErrors.coverLetter = 'Cover letter must be at least 100 characters long';
    }

    if (!formData.resume) {
      newErrors.resume = 'Resume is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      // Add timestamp
      submitData.append('appliedAt', new Date().toISOString());
      submitData.append('status', 'pending');

      // Call the onSubmit function passed from parent
      await onSubmit(submitData);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <div className="applicant-form-overlay">
      <div className="applicant-form-modal">
        <div className="form-header">
          <h2>Job Application</h2>
          <button 
            className="close-btn" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <i className="bx bx-x"></i>
          </button>
        </div>

        <div className="job-info">
          <h3>{job?.title || 'General Application'}</h3>
          <p>{job?.department || 'Various Departments'}</p>
        </div>

        <form onSubmit={handleSubmit} className="applicant-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gmail">Email Address *</label>
              <input
                type="email"
                id="gmail"
                name="gmail"
                value={formData.gmail}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className={errors.gmail ? 'error' : ''}
              />
              {errors.gmail && <span className="error-message">{errors.gmail}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Enter your age"
                min="16"
                max="100"
                className={errors.age ? 'error' : ''}
              />
              {errors.age && <span className="error-message">{errors.age}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your full address"
              rows="3"
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="position">Position Applied For *</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="Enter the position you're applying for"
                className={errors.position ? 'error' : ''}
              />
              {errors.position && <span className="error-message">{errors.position}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="experience">Years of Experience *</label>
              <input
                type="text"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="e.g., 2-5 years"
                className={errors.experience ? 'error' : ''}
              />
              {errors.experience && <span className="error-message">{errors.experience}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="education">Education *</label>
            <textarea
              id="education"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              placeholder="Enter your educational background"
              rows="3"
              className={errors.education ? 'error' : ''}
            />
            {errors.education && <span className="error-message">{errors.education}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills & Qualifications *</label>
            <textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="List your relevant skills and qualifications"
              rows="3"
              className={errors.skills ? 'error' : ''}
            />
            {errors.skills && <span className="error-message">{errors.skills}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="coverLetter">Cover Letter *</label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              placeholder="Write a cover letter explaining why you're interested in this position and what makes you a good fit"
              rows="6"
              className={errors.coverLetter ? 'error' : ''}
            />
            {errors.coverLetter && <span className="error-message">{errors.coverLetter}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="resume">Resume/CV *</label>
            <input
              type="file"
              id="resume"
              name="resume"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className={errors.resume ? 'error' : ''}
            />
            <small className="file-help">Accepted formats: PDF, DOC, DOCX (Max size: 5MB)</small>
            {errors.resume && <span className="error-message">{errors.resume}</span>}
          </div>

          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicantForm;
