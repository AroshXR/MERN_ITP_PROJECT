const express = require("express");
const router = express.Router();

// Import Job controller
const JobController = require("../controllers/JobController");

// Public routes (for career page)
router.get("/", JobController.getAllJobs);
router.get("/:id", JobController.getJobById);

// Admin routes (should be protected with auth middleware)
router.post("/", JobController.createJob);
router.put("/:id", JobController.updateJob);
router.delete("/:id", JobController.deleteJob);
router.patch("/:id/status", JobController.updateJobStatus);
router.get("/admin/all", JobController.getAllJobsAdmin);

module.exports = router;
