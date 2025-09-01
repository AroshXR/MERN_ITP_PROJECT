// models/ApplicantModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applicantSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  gmail: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    ]
  },
  age: {
    type: Number,
    required: [true, "Age is required"],
    min: [16, "Age must be at least 16 years old"],
    max: [100, "Age cannot exceed 100 years"]
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
    minlength: [10, "Address must be at least 10 characters long"]
  },
  phone: {
    type: String,
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      "Please enter a valid phone number"
    ]
  },
  position: {
    type: String,
    required: [true, "Position is required"],
    trim: true
  },
  department: {
    type: String,
    required: [true, "Department is required"],
    trim: true
  },
  experience: {
    type: String,
    required: [true, "Experience is required"],
    trim: true
  },
  education: {
    type: String,
    required: [true, "Education is required"],
    trim: true
  },
  skills: {
    type: String,
    required: [true, "Skills are required"],
    trim: true
  },
  coverLetter: {
    type: String,
    required: [true, "Cover letter is required"],
    trim: true,
    minlength: [100, "Cover letter must be at least 100 characters long"]
  },
  resume: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for applicant's full profile
applicantSchema.virtual('profile').get(function() {
  return `${this.name} (${this.age} years old) - ${this.gmail}`;
});

// Index for better query performance
applicantSchema.index({ gmail: 1 });
applicantSchema.index({ status: 1 });

module.exports = mongoose.model("Applicant", applicantSchema);
