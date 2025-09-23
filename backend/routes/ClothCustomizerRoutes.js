const express = require("express");
const router = express.Router();

const ClothCustomizerController = require("../controllers/ClothCustomizerController");
const { protect } = require("../middleware/auth");

// Require authentication for all cloth customizer routes
router.use(protect);

router.get("/", ClothCustomizerController.getAllClothCustomizers);
router.post("/", ClothCustomizerController.addClothCustomizer);
router.get("/:id", ClothCustomizerController.getClothCustomizerById);
router.put("/:id", ClothCustomizerController.updateClothCustomizer);
router.delete("/:id", ClothCustomizerController.deleteClothCustomizer);

module.exports = router;
