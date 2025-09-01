const Job = require("../models/JobModel");

// Get all active jobs
const getAllJobs = async (req, res, next) => {
  try {
    const { department, type, page = 1, limit = 10 } = req.query;
    
    let query = { status: "active" };
    if (department) query.department = department;
    if (type) query.type = type;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { postedAt: -1 }
    };
    
    const jobs = await Job.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);
    
    const total = await Job.countDocuments(query);
    
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ 
        message: "No jobs found",
        data: [],
        pagination: { page: options.page, limit: options.limit, total: 0 }
      });
    }
    
    return res.status(200).json({ 
      message: "Jobs retrieved successfully",
      data: jobs,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (err) {
    console.error("Error in getAllJobs:", err);
    return res.status(500).json({ 
      message: "Internal server error while fetching jobs",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get job by ID
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid job ID format" });
    }
    
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    return res.status(200).json({ 
      message: "Job retrieved successfully",
      data: job
    });
  } catch (err) {
    console.error("Error in getJobById:", err);
    return res.status(500).json({ 
      message: "Internal server error while fetching job",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Create new job (Admin only)
const createJob = async (req, res, next) => {
  try {
    const { 
      title, department, location, type, experience, description, 
      requirements, responsibilities, benefits, salary, deadline 
    } = req.body;
    
    // Basic validation
    if (!title || !department || !location || !type || !experience || !description) {
      return res.status(400).json({ 
        message: "Missing required fields" 
      });
    }
    
    const jobData = {
      title,
      department,
      location,
      type,
      experience,
      description,
      postedBy: req.user?.id || "admin" // This should come from auth middleware
    };
    
    if (requirements && Array.isArray(requirements)) {
      jobData.requirements = requirements;
    }
    
    if (responsibilities && Array.isArray(responsibilities)) {
      jobData.responsibilities = responsibilities;
    }
    
    if (benefits && Array.isArray(benefits)) {
      jobData.benefits = benefits;
    }
    
    if (salary) {
      jobData.salary = salary;
    }
    
    if (deadline) {
      jobData.deadline = new Date(deadline);
    }
    
    const job = new Job(jobData);
    const savedJob = await job.save();
    
    return res.status(201).json({ 
      message: "Job created successfully",
      data: savedJob
    });
  } catch (err) {
    console.error("Error in createJob:", err);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: "Validation failed",
        errors: validationErrors
      });
    }
    
    return res.status(500).json({ 
      message: "Internal server error while creating job",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update job (Admin only)
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid job ID format" });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    return res.status(200).json({ 
      message: "Job updated successfully",
      data: updatedJob
    });
  } catch (err) {
    console.error("Error in updateJob:", err);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: "Validation failed",
        errors: validationErrors
      });
    }
    
    return res.status(500).json({ 
      message: "Internal server error while updating job",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Delete job (Admin only)
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid job ID format" });
    }
    
    const deletedJob = await Job.findByIdAndDelete(id);
    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    return res.status(200).json({ 
      message: "Job deleted successfully",
      data: { id: deletedJob._id, title: deletedJob.title }
    });
  } catch (err) {
    console.error("Error in deleteJob:", err);
    return res.status(500).json({ 
      message: "Internal server error while deleting job",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update job status (Admin only)
const updateJobStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid job ID format" });
    }
    
    if (!status || !['active', 'inactive', 'closed'].includes(status)) {
      return res.status(400).json({ 
        message: "Status must be one of: active, inactive, closed" 
      });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    return res.status(200).json({ 
      message: "Job status updated successfully",
      data: updatedJob
    });
  } catch (err) {
    console.error("Error in updateJobStatus:", err);
    return res.status(500).json({ 
      message: "Internal server error while updating job status",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get all jobs (Admin only - includes inactive/closed)
const getAllJobsAdmin = async (req, res, next) => {
  try {
    const { status, department, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { postedAt: -1 }
    };
    
    const jobs = await Job.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);
    
    const total = await Job.countDocuments(query);
    
    return res.status(200).json({ 
      message: "Jobs retrieved successfully",
      data: jobs,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    });
  } catch (err) {
    console.error("Error in getAllJobsAdmin:", err);
    return res.status(500).json({ 
      message: "Internal server error while fetching jobs",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.getAllJobs = getAllJobs;
exports.getJobById = getJobById;
exports.createJob = createJob;
exports.updateJob = updateJob;
exports.deleteJob = deleteJob;
exports.updateJobStatus = updateJobStatus;
exports.getAllJobsAdmin = getAllJobsAdmin;
