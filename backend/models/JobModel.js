const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSchema = new Schema({
  title: {
    type: String,
    required: [true, "Job title is required"],
    trim: true,
    minlength: [2, "Job title must be at least 2 characters long"]
  },
  department: {
    type: String,
    required: [true, "Department is required"],
    trim: true
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true
  },
  type: {
    type: String,
    required: [true, "Job type is required"],
    enum: ["Full-time", "Part-time", "Contract", "Internship"],
    default: "Full-time"
  },
  experience: {
    type: String,
    required: [true, "Experience requirement is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Job description is required"],
    trim: true,
    minlength: [50, "Job description must be at least 50 characters long"]
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: "USD"
    }
  },
  status: {
    type: String,
    enum: ["active", "inactive", "closed"],
    default: "active"
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  postedAt: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date
  },
  applications: [{
    type: Schema.Types.ObjectId,
    ref: "ApplicantModel"
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for job status
jobSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applications.length;
});

// Index for better query performance
jobSchema.index({ status: 1, department: 1 });
jobSchema.index({ postedAt: -1 });
jobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model("Job", jobSchema);
