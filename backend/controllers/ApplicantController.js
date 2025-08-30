const Applicant = require("../models/ApplicantModel");


// Get all applicants
const getAllApplicants = async (req, res, next) => {
  try {
    const applicants = await Applicant.find();
    if (!applicants || applicants.length === 0) {
      return res.status(404).json({ message: "No applicants found" });
    }
    return res.status(200).json({ applicants });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error while fetching applicants" });
  }
};

// Add a new applicant
const addApplicant = async (req, res, next) => {
  const { name, gmail, age, address } = req.body;

  try {
    const applicant = new Applicant({ name, gmail, age, address });
    await applicant.save();
    return res.status(201).json({ applicant });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add applicant" });
  }
};

// Get applicant by ID
const getApplicantById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const applicant = await Applicant.findById(id);
    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found" });
    }
    return res.status(200).json({ applicant });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error while fetching applicant" });
  }
};

// Update applicant details
const updateApplicant = async (req, res, next) => {
  const id = req.params.id;
  const { name, gmail, age, address } = req.body;

  try {
    const updatedApplicant = await Applicant.findByIdAndUpdate(
      id,
      { name, gmail, age, address },
      { new: true } // return the updated document
    );
    if (!updatedApplicant) {
      return res.status(404).json({ message: "Unable to update applicant" });
    }
    return res.status(200).json({ applicant: updatedApplicant });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error while updating applicant" });
  }
};

// Delete applicant
const deleteApplicant = async (req, res, next) => {
  const id = req.params.id;

  try {
    const deletedApplicant = await Applicant.findByIdAndDelete(id);
    if (!deletedApplicant) {
      return res.status(404).json({ message: "Unable to delete applicant" });
    }
    return res.status(200).json({ message: "Applicant deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error while deleting applicant" });
  }
};

exports.getAllApplicants = getAllApplicants;
exports.addApplicant = addApplicant;
exports.getApplicantById = getApplicantById;
exports.updateApplicant = updateApplicant;
exports.deleteApplicant = deleteApplicant;
