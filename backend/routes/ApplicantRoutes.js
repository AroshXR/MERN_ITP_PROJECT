

const express = require("express");
const router = express.Router();

//Insert Model
const User = require("../models/ApplicantModel");

// Insert Applicant controller
const ApplicantController = require("../controllers/ApplicantController");

// Routes for Applicants
router.get("/", ApplicantController.getAllApplicants);
router.post("/", ApplicantController.addApplicant);
router.get("/:id", ApplicantController.getApplicantById);
router.put("/:id", ApplicantController.updateApplicant);
router.delete("/:id", ApplicantController.deleteApplicant);

// Export router
module.exports = router;
