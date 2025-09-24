const express = require("express");  // Replaced import with require
const { protect } = require("../middleware/auth");  // Replaced import with require
const ownerController = require("../controllers/ownerController");  // Replaced import with require
const upload = require("../middleware/multer");

const ownerRouter = express.Router();

// Safety wrapper to avoid "argument handler must be a function" on startup
const h = (fnName) => {
  const fn = ownerController[fnName];
  if (typeof fn !== 'function') {
    console.error(`[ownerRoutes] Missing handler: ${fnName}`);
    return (req, res) => res.status(500).json({ success: false, message: `Handler '${fnName}' not available` });
  }
  return fn;
};

ownerRouter.post("/change-role", protect, h('changeRoleToOwner'));
ownerRouter.post("/add-outfit", protect, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 3 }
]), h('addOutfit'));
ownerRouter.get("/outfits", protect, h('getOwnerOutfits'));
ownerRouter.get("/all-outfits", h('getAllOutfits')); // Public endpoint for browsing
ownerRouter.post("/toggle-outfit", protect, h('toggleOutfitAvailability'));
ownerRouter.post("/delete-outfit", protect, h('deleteOutfit'));

ownerRouter.get("/dashboard", protect, h('getDashboardData'));
ownerRouter.post("/update-image", protect, upload.single("image"), h('updateUserImage'));



module.exports = ownerRouter;  // Replaced export default with module.exports
