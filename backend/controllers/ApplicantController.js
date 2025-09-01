const Applicant = require("../models/ApplicantModel");

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
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
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
    
    if (!applicants || applicants.length === 0) {
      return res.status(404).json({ 
        message: "No applicants found",
        data: [],
        pagination: { page: options.page, limit: options.limit, total: 0 }
      });
    }
    
    return res.status(200).json({ 
      message: "Applicants retrieved successfully",
      data: applicants,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (err) {
    console.error("Error in getAllApplicants:", err);
    return res.status(500).json({ 
      message: "Internal server error while fetching applicants",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
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
    const { status } = req.body;
    
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
      { status },
      { new: true }
    );
    
    if (!updatedApplicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    
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
