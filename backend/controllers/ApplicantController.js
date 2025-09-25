const Applicant = require("../models/ApplicantModel");
const User = require("../models/User");
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
    
    // Create an in-app notification for the matching User (by email)
    try {
      const user = await User.findOne({ email: updatedApplicant.gmail.toLowerCase(), type: "Applicant" }).select("_id");
      if (user) {
        const currentDate = new Date().toLocaleDateString();
        const applicationDetails = `
📋 Application Details:
• Position: ${updatedApplicant.position}
• Department: ${updatedApplicant.department}
• Applied Date: ${new Date(updatedApplicant.appliedAt || updatedApplicant.createdAt).toLocaleDateString()}
• Status Update: ${currentDate}`;

        const notificationMessage = status === 'approved' 
          ? `🎉 CONGRATULATIONS! Your application has been APPROVED!

${applicationDetails}

${statusMessage ? `📝 Admin Message: ${statusMessage}` : ''}

🎯 Next Steps:
• Check your email for detailed instructions
• Our HR team will contact you soon
• Prepare for the next phase of the hiring process

Welcome to the team! 🚀`
          : status === 'rejected'
          ? `❌ Application Status Update - REJECTED

${applicationDetails}

${statusMessage ? `📝 Admin Message: ${statusMessage}` : ''}

💡 What's Next:
• Don't be discouraged - this is part of the journey
• Consider applying for other positions that match your skills
• Use this as a learning experience for future applications

Thank you for your interest in our company! 🙏`
          : `📢 Application Status Update - ${status.toUpperCase()}

${applicationDetails}

${statusMessage ? `📝 Admin Message: ${statusMessage}` : ''}

Stay tuned for further updates! 📬`;
        
        await User.findByIdAndUpdate(
          user._id,
          {
            $push: {
              notifications: {
                message: notificationMessage,
                level: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
                read: false,
                createdAt: new Date(),
                // Add additional metadata for better tracking
                metadata: {
                  applicantId: updatedApplicant._id,
                  position: updatedApplicant.position,
                  department: updatedApplicant.department,
                  status: status,
                  statusMessage: statusMessage || null,
                  type: 'application_status_update'
                }
              }
            }
          }
        );
        console.log(`✅ Created detailed notification for user ${user._id} - Application ${status} for ${updatedApplicant.position}`);
      } else {
        console.log(`⚠️ No user found with email ${updatedApplicant.gmail} and type "Applicant"`);
      }
    } catch (notifyErr) {
      console.warn("⚠️ Failed to create user notification:", notifyErr?.message);
    }

    // Notify applicant via email
    const subject = `Application Status Update - ${status.toUpperCase()}`;
    const messageText = statusMessage || `Your application for the position of ${updatedApplicant.position} has been ${status}.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Application Status Update
        </h2>
        <p>Dear ${updatedApplicant.name},</p>
        <p>We hope this email finds you well. We would like to inform you about the status of your application.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Status: ${status.toUpperCase()}</h3>
          <p style="margin-bottom: 0;">${messageText}</p>
        </div>
        ${status === 'approved' ? `
          <p>Congratulations! We are excited about the possibility of you joining our team. Our HR team will be in touch with you soon regarding the next steps.</p>
        ` : status === 'rejected' ? `
          <p>We appreciate your interest in our company and the time you took to apply. While we have decided not to move forward with your application at this time, we encourage you to apply for other positions that may be a better fit for your skills and experience.</p>
        ` : ''}
        <p>Thank you for your interest in our company.</p>
        <p>Best regards,<br/>HR Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;
    
    const emailResult = await sendEmail({ 
      to: updatedApplicant.gmail, 
      subject, 
      text: messageText, 
      html 
    });
    
    if (!emailResult.success) {
      console.warn(`⚠️  Failed to send status update email to ${updatedApplicant.gmail}:`, emailResult.error);
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

    // Do not allow scheduling if rejected
    const current = await Applicant.findById(id).select('status');
    if (!current) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    if (current.status === 'rejected') {
      return res.status(400).json({ message: "Cannot schedule interview for a rejected application" });
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

    // Create an in-app notification for the matching User (by email)
    try {
      const user = await User.findOne({ email: updatedApplicant.gmail.toLowerCase(), type: "Applicant" }).select("_id");
      if (user) {
        const interviewTime = new Date(interview.scheduledAt).toLocaleString();
        const interviewDate = new Date(interview.scheduledAt).toLocaleDateString();
        const interviewTimeOnly = new Date(interview.scheduledAt).toLocaleTimeString();
        
        const notifMessage = `🎯 INTERVIEW SCHEDULED - Great News!

📋 Application Details:
• Position: ${updatedApplicant.position}
• Department: ${updatedApplicant.department}
• Applicant: ${updatedApplicant.name}

📅 Interview Information:
• Date: ${interviewDate}
• Time: ${interviewTimeOnly}
${interview.mode ? `• Mode: ${interview.mode}` : ''}
${interview.location ? `• Location: ${interview.location}` : ''}
${interview.meetingLink ? `• Meeting Link: ${interview.meetingLink}` : ''}

${interview.notes ? `📝 Additional Notes:
${interview.notes}

` : ''}✅ Preparation Tips:
• Arrive 10 minutes early
• Bring copies of your resume
• Research our company
• Prepare questions about the role
• Dress professionally
${interview.meetingLink ? '• Test your internet connection beforehand' : ''}

Good luck! We're excited to meet you! 🚀`;

        await User.findByIdAndUpdate(
          user._id,
          {
            $push: {
              notifications: {
                message: notifMessage,
                level: 'info',
                read: false,
                createdAt: new Date(),
                metadata: {
                  applicantId: updatedApplicant._id,
                  position: updatedApplicant.position,
                  department: updatedApplicant.department,
                  interviewDate: interview.scheduledAt,
                  interviewMode: interview.mode || null,
                  interviewLocation: interview.location || null,
                  meetingLink: interview.meetingLink || null,
                  type: 'interview_scheduled'
                }
              }
            }
          }
        );
        console.log(`✅ Created detailed interview notification for user ${user._id} - Interview scheduled for ${updatedApplicant.position}`);
      }
    } catch (notifyErr) {
      console.warn("⚠️ Failed to create interview notification:", notifyErr?.message);
    }

    const interviewTime = new Date(interview.scheduledAt).toLocaleString();
    const subject = `Interview Scheduled - ${updatedApplicant.position}`;
    const details = `Time: ${interviewTime}${location ? `, Location: ${location}` : ""}${meetingLink ? `, Link: ${meetingLink}` : ""}`;
    const text = `Dear ${updatedApplicant.name},\n\nYour interview has been scheduled. ${details}.\n\n${notes ? `Notes: ${notes}\n\n` : ""}Regards,\nHR Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
          Interview Scheduled
        </h2>
        <p>Dear ${updatedApplicant.name},</p>
        <p>Great news! We are pleased to inform you that your interview has been scheduled for the position of <strong>${updatedApplicant.position}</strong>.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
          <h3 style="color: #28a745; margin-top: 0;">Interview Details</h3>
          <p><strong>Date & Time:</strong> ${interviewTime}</p>
          ${location ? `<p><strong>Location:</strong> ${location}</p>` : ''}
          ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #007bff;">${meetingLink}</a></p>` : ''}
          ${mode ? `<p><strong>Mode:</strong> ${mode}</p>` : ''}
        </div>
        ${notes ? `
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">Additional Notes</h4>
            <p style="margin-bottom: 0;">${notes}</p>
          </div>
        ` : ''}
        <div style="background-color: #d1ecf1; padding: 15px; border-left: 4px solid #17a2b8; margin: 20px 0;">
          <h4 style="color: #0c5460; margin-top: 0;">Important Reminders</h4>
          <ul style="margin-bottom: 0;">
            <li>Please arrive 10 minutes early for your interview</li>
            <li>Bring a copy of your resume and any relevant documents</li>
            <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
            ${meetingLink ? '<li>For online interviews, ensure you have a stable internet connection</li>' : ''}
          </ul>
        </div>
        <p>We look forward to meeting with you and learning more about your qualifications.</p>
        <p>Best regards,<br/>HR Team</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;
    
    const emailResult = await sendEmail({ 
      to: updatedApplicant.gmail, 
      subject, 
      text, 
      html 
    });
    
    if (!emailResult.success) {
      console.warn(`⚠️  Failed to send interview scheduling email to ${updatedApplicant.gmail}:`, emailResult.error);
    }

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

// Get applicant report data
const getApplicantReport = async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;
    const allowedStatuses = ['pending', 'approved', 'rejected', 'all'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status filter. Use pending, approved, rejected, or all"
      });
    }

    const query = status === 'all' ? {} : { status };

    const applicants = await Applicant.find(query)
      .select('name gmail position department status appliedAt resume')
      .sort({ appliedAt: -1 })
      .lean();

    const reportData = applicants.map(applicant => ({
      id: applicant._id,
      name: applicant.name,
      email: applicant.gmail,
      position: applicant.position,
      department: applicant.department,
      status: applicant.status,
      appliedAt: applicant.appliedAt,
      resume: applicant.resume
    }));

    return res.status(200).json({
      message: "Applicant report generated successfully",
      data: reportData,
      filters: { status }
    });
  } catch (err) {
    console.error("Error in getApplicantReport:", err);
    return res.status(500).json({
      message: "Internal server error while generating applicant report",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
// Get recruitment analytics
const getRecruitmentAnalytics = async (req, res, next) => {
  try {
    // Get all applicants with their data
    const applicants = await Applicant.find({}).lean();
    
    // Calculate metrics
    const totalApplicants = applicants.length;
    const statusCounts = applicants.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    
    // Group by position
    const applicantsByPosition = applicants.reduce((acc, app) => {
      if (!acc[app.position]) {
        acc[app.position] = { total: 0, pending: 0, approved: 0, rejected: 0 };
      }
      acc[app.position].total++;
      acc[app.position][app.status]++;
      return acc;
    }, {});
    
    // Interview schedules
    const interviewSchedules = applicants
      .filter(app => app.interview?.scheduledAt)
      .map(app => ({
        id: app._id,
        name: app.name,
        position: app.position,
        scheduledAt: app.interview.scheduledAt,
        mode: app.interview.mode,
        location: app.interview.location,
        meetingLink: app.interview.meetingLink
      }))
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    
    // Pending applications
    const pendingApplications = applicants
      .filter(app => app.status === 'pending')
      .map(app => ({
        id: app._id,
        name: app.name,
        email: app.gmail,
        position: app.position,
        appliedAt: app.appliedAt,
        resume: app.resume
      }));
    
    // Shortlisted vs rejected ratio
    const shortlistedCount = statusCounts.approved || 0;
    const rejectedCount = statusCounts.rejected || 0;
    const shortlistedRatio = totalApplicants > 0 ? (shortlistedCount / totalApplicants * 100).toFixed(1) : 0;
    const rejectedRatio = totalApplicants > 0 ? (rejectedCount / totalApplicants * 100).toFixed(1) : 0;
    
    const analytics = {
      summary: {
        totalApplicants,
        pending: statusCounts.pending || 0,
        approved: statusCounts.approved || 0,
        rejected: statusCounts.rejected || 0,
        shortlistedRatio: `${shortlistedRatio}%`,
        rejectedRatio: `${rejectedRatio}%`
      },
      applicantsByPosition,
      interviewSchedules,
      pendingApplications
    };
    
    return res.status(200).json({
      message: "Recruitment analytics retrieved successfully",
      data: analytics
    });
  } catch (err) {
    console.error("Error in getRecruitmentAnalytics:", err);
    return res.status(500).json({
      message: "Internal server error while fetching analytics",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getApplicantReport = getApplicantReport;
exports.getRecruitmentAnalytics = getRecruitmentAnalytics;


