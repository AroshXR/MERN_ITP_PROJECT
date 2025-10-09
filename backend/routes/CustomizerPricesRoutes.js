const express = require("express");
const router = express.Router();

const CustomizerPricesController = require("../controllers/CustomizerPricesController");
const { protect, adminOnly } = require("../middleware/auth");

// Public route to get current prices
router.get("/", CustomizerPricesController.getCustomizerPrices);

// Admin-only routes for managing prices
router.use(protect);
router.use(adminOnly);

router.put("/", CustomizerPricesController.updateCustomizerPrices);
router.post("/preset-designs", CustomizerPricesController.addPresetDesign);
router.put("/preset-designs/:designId", CustomizerPricesController.updatePresetDesign);
router.delete("/preset-designs/:designId", CustomizerPricesController.deletePresetDesign);

module.exports = router;
