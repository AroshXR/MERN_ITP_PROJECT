const Applicant = require("../models/ApplicantModel");
const { sendEmail } = require("../utils/email");

// Input validation helper
const validateApplicantInput = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }
  
  if (!data.gmail || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.gmail)) {
    errors.push("Please provide a valid email address");
  }
  
  if (!data.age || data.age < 16 || data.age > 100) {
    errors.push("Age must be between 16 and 100 years");
  }
  
  if (!data.address || data.address.trim().length < 10) {
    errors.push("Address must be at least 10 characters long");
  }
  
  if (!data.position || data.position.trim().length < 2) {
    errors.push("Position is required");
  }
  
  if (!data.department || data.department.trim().length < 2) {
    errors.push("Department is required");
  }
  
  if (!data.experience || data.experience.trim().length < 2) {
    errors.push("Experience is required");
  }
  
  if (!data.education || data.education.trim().length < 2) {
    errors.push("Education is required");
  }
  
  if (!data.skills || data.skills.trim().length < 2) {
    errors.push("Skills are required");
  }
  
  if (!data.coverLetter || data.coverLetter.trim().length < 100) {
    errors.push("Cover letter must be at least 100 characters long");
  }
  
  return errors;
};

// Get all applicants
const getAllApplicants = async (req, res, next) => {
  try {
    const { status, gmail, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    if (gmail) {
      query.gmail = String(gmail).toLowerCase();
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    };
    
    const applicants = await Applicant.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);
    
    const total = await Applicant.countDocuments(query);
    
    return res.status(200).json({ 
      message: "Applicants retrieved successfully",
      data: applicants || [],
      pagination: {
        page: options.page,
        limit: options.limit,
        total: total || 0,
        pages: Math.ceil((total || 0) / options.limit)
      }
    });
  } catch (err) {
    console.error("Error in getAllApplicants:", err);
    // Return empty list to avoid breaking the admin UI while diagnosing backend issues
    return res.status(200).json({ 
      message: "Applicants retrieved successfully",
      data: [],
      pagination: { page: 1, limit: 0, total: 0, pages: 0 },
      error: err?.message
    });
  }
};

// Add a new applicant
const addApplicant = async (req, res, next) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { 
      name, gmail, age, address, phone, position, department, 
      experience, education, skills, coverLetter 
    } = req.body;
    
    // Validate input
    const validationErrors = validateApplicantInput({ 
      name, gmail, age, address, position, department, 
      experience, education, skills, coverLetter 
    });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed",
        errors: validationErrors
      });
    }
    
    // Check if applicant with same email already exists
    const existingApplicant = await Applicant.findOne({ gmail: gmail.toLowerCase() });
    if (existingApplicant) {
      return res.status(409).json({ 
        message: "An applicant with this email already exists" 
      });
    }
    
    // Handle resume file if uploaded
    let resumeData = null;
    if (req.file) {
      resumeData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }
    
    const applicantData = { 
      name, gmail, age, address, position, department, 
      experience, education, skills, coverLetter 
    };
    if (phone) applicantData.phone = phone;
    if (resumeData) applicantData.resume = resumeData;
    
    console.log('Applicant data to save:', applicantData);
    
    const applicant = new Applicant(applicantData);
    const savedApplicant = await applicant.save();
    
    console.log('Saved applicant:', savedApplicant);
    
    return res.status(201).json({ 
      message: "Application submitted successfully",
      data: savedApplicant
    });
  } catch (err) {
    console.error("Error in addApplicant:", err);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: "Validation failed",
        errors: validationErrors
      });
    }
    
    return res.status(500).json({ 
      message: "Internal server error while submitting application",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get applicant by ID
const getApplicantById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid applicant ID format" });
    }
    
    const applicant = await Applicant.findById(id);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    return res.status(200).json({ 
      message: "Applicant retrieved successfully",
      data: applicant
    });
  } catch (err) {
    console.error("Error in getApplicantById:", err);
    return res.status(500).json({ 
      message: "Internal server error while fetching applicant",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update applicant details
const updateApplicant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, gmail, age, address, phone, status } = req.body;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid applicant ID format" });
    }
    
    // Validate input if provided
    if (name || gmail || age || address) {
      const validationErrors = validateApplicantInput({ 
        name: name || '', 
        gmail: gmail || '', 
        age: age || 0, 
        address: address || '' 
      });
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          message: "Validation failed",
          errors: validationErrors
        });
      }
    }
    
    // Check if email is being updated and if it already exists
    if (gmail) {
      const existingApplicant = await Applicant.findOne({ 
        gmail: gmail.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (existingApplicant) {
        return res.status(409).json({ 
          message: "An applicant with this email already exists" 
        });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (gmail) updateData.gmail = gmail;
    if (age) updateData.age = age;
    if (address) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      updateData.status = status;
    }
    
    const updatedApplicant = await Applicant.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedApplicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    return res.status(200).json({ 
      message: "Applicant updated successfully",
      data: updatedApplicant
    });
  } catch (err) {
    console.error("Error in updateApplicant:", err);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: "Validation failed",
        errors: validationErrors
      });
    }
    
    return res.status(500).json({ 
      message: "Internal server error while updating applicant",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Delete applicant
const deleteApplicant = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid applicant ID format" });
    }
    
    const deletedApplicant = await Applicant.findByIdAndDelete(id);
    if (!deletedApplicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    return res.status(200).json({ 
      message: "Applicant deleted successfully",
      data: { id: deletedApplicant._id, name: deletedApplicant.name }
    });
  } catch (err) {
    console.error("Error in deleteApplicant:", err);
    return res.status(500).json({ 
      message: "Internal server error while deleting applicant",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update applicant status
const updateApplicantStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, statusMessage } = req.body;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid applicant ID format" });
    }
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        message: "Status must be one of: pending, approved, rejected" 
      });
    }
    
    const updatedApplicant = await Applicant.findByIdAndUpdate(
      id,
      { status, ...(statusMessage ? { statusMessage } : {}) },
      { new: true }
    );
    
    if (!updatedApplicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
    // Notify applicant via email (best-effort)
    const subject = `Your application status: ${status}`;
    const messageText = statusMessage || `Your application has been ${status}.`;
    const html = `<p>Dear ${updatedApplicant.name},</p>
      <p>${messageText}</p>
      <p>Regards,<br/>HR Team</p>`;
    try { await sendEmail({ to: updatedApplicant.gmail, subject, text: messageText, html }); } catch (_) {}

    return res.status(200).json({ 
      message: "Applicant status updated successfully",
      data: updatedApplicant
    });
  } catch (err) {
    console.error("Error in updateApplicantStatus:", err);
    return res.status(500).json({ 
      message: "Internal server error while updating applicant status",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getAllApplicants = getAllApplicants;
exports.addApplicant = addApplicant;
exports.getApplicantById = getApplicantById;
exports.updateApplicant = updateApplicant;
exports.deleteApplicant = deleteApplicant;
exports.updateApplicantStatus = updateApplicantStatus;

// Schedule interview for an applicant
const scheduleInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scheduledAt, location, mode, meetingLink, notes } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid applicant ID format" });
    }

    if (!scheduledAt) {
      return res.status(400).json({ message: "scheduledAt is required" });
    }

    const interview = {
      scheduledAt: new Date(scheduledAt),
      location: location || undefined,
      mode: mode || undefined,
      meetingLink: meetingLink || undefined,
      notes: notes || undefined
    };

    const updatedApplicant = await Applicant.findByIdAndUpdate(
      id,
      { interview },
      { new: true }
    );

    if (!updatedApplicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    const interviewTime = new Date(interview.scheduledAt).toLocaleString();
    const subject = "Interview Scheduled";
    const details = `Time: ${interviewTime}${location ? `, Location: ${location}` : ""}${meetingLink ? `, Link: ${meetingLink}` : ""}`;
    const text = `Dear ${updatedApplicant.name},\n\nYour interview has been scheduled. ${details}.\n\n${notes ? `Notes: ${notes}\n\n` : ""}Regards,\nHR Team`;
    const html = `<p>Dear ${updatedApplicant.name},</p><p>Your interview has been scheduled.</p><p>${details}</p>${notes ? `<p>Notes: ${notes}</p>` : ""}<p>Regards,<br/>HR Team</p>`;
    try { await sendEmail({ to: updatedApplicant.gmail, subject, text, html }); } catch (_) {}

    return res.status(200).json({
      message: "Interview scheduled successfully",
      data: updatedApplicant
    });
  } catch (err) {
    console.error("Error in scheduleInterview:", err);
    return res.status(500).json({ 
      message: "Internal server error while scheduling interview",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.scheduleInterview = scheduleInterview;
