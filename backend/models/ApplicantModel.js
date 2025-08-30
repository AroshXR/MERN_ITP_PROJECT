// models/ApplicantModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const applicantSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true // remove leading/trailing spaces
  },
  gmail: {
    type: String,
    required: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
  },
  age: {
    type: Number,
    required: true,
    min: 18 // example: minimum age requirement
  },
  address: {
    type: String,
    required: true
  }
}, { timestamps: true }); // adds createdAt & updatedAt

module.exports = mongoose.model("Applicant", applicantSchema);
