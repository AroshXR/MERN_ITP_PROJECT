

const express = require("express");
const router = express.Router();

//Insert Model
const ClothCustomizer = require("../models/ClothCustomizerModel");

// Insert ClothCustomizer controller
const ClothCustomizerController = require("../controllers/ClothCustomizerController");

// Import authentication middleware (temporarily disabled)
// const { protect } = require("../middleware/auth");

// Routes for ClothCustomizer (authentication disabled for testing)
router.get("/", ClothCustomizerController.getAllClothCustomizers);
router.post("/", ClothCustomizerController.addClothCustomizer); // Temporarily unprotected
router.get("/:id", ClothCustomizerController.getClothCustomizerById);
router.put("/:id", ClothCustomizerController.updateClothCustomizer); // Temporarily unprotected
router.delete("/:id", ClothCustomizerController.deleteClothCustomizer); // Temporarily unprotected

// Export router
module.exports = router;
