

const express = require("express");
const router = express.Router();
const multer = require("multer");

// Import Applicant controller
const ApplicantController = require("../controllers/ApplicantController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only PDF and Word documents
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false);
    }
  }
});

// Input validation middleware
const validateApplicantInput = (req, res, next) => {
  const { name, gmail, age, address, position, department, experience, education, skills, coverLetter } = req.body;
  const errors = [];
  
  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }
  
  if (!gmail || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(gmail)) {
    errors.push("Please provide a valid email address");
  }
  
  if (!age || age < 16 || age > 100) {
    errors.push("Age must be between 16 and 100 years");
  }
  
  if (!address || address.trim().length < 10) {
    errors.push("Address must be at least 10 characters long");
  }
  
  if (!position || position.trim().length < 2) {
    errors.push("Position is required");
  }
  
  if (!department || department.trim().length < 2) {
    errors.push("Department is required");
  }
  
  if (!experience || experience.trim().length < 2) {
    errors.push("Experience is required");
  }
  
  if (!education || education.trim().length < 2) {
    errors.push("Education is required");
  }
  
  if (!skills || skills.trim().length < 2) {
    errors.push("Skills are required");
  }
  
  if (!coverLetter || coverLetter.trim().length < 100) {
    errors.push("Cover letter must be at least 100 characters long");
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors
    });
  }
  
  next();
};

// ID validation middleware
const validateId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid applicant ID format" });
  }
  
  next();
};

// Routes for Applicants
router.get("/", ApplicantController.getAllApplicants);
router.post("/", upload.single('resume'), validateApplicantInput, ApplicantController.addApplicant);
router.get("/:id", validateId, ApplicantController.getApplicantById);
router.put("/:id", validateId, ApplicantController.updateApplicant);
router.delete("/:id", validateId, ApplicantController.deleteApplicant);
router.patch("/:id/status", validateId, ApplicantController.updateApplicantStatus);
router.post("/:id/schedule-interview", validateId, ApplicantController.scheduleInterview);

// Export router
module.exports = router;
