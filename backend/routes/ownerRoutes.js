const express = require("express");  // Replaced import with require
const { protect } = require("../middleware/auth");  // Replaced import with require
const { changeRoleToOwner, addOutfit, getOwnerOutfits, getAllOutfits, toggleOutfitAvailability, deleteOutfit, getDashboardData, updateUserImage } = require("../controllers/ownerController");  // Replaced import with require
const upload = require("../middleware/multer");

const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleToOwner);
ownerRouter.post("/add-outfit", protect, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 3 }
]), addOutfit);
ownerRouter.get("/outfits", protect, getOwnerOutfits);
ownerRouter.get("/all-outfits", getAllOutfits); // Public endpoint for browsing
ownerRouter.post("/toggle-outfit", protect, toggleOutfitAvailability);
ownerRouter.post("/delete-outfit", protect, deleteOutfit);

ownerRouter.get("/dashboard", protect, getDashboardData);
ownerRouter.post("/update-image", protect, upload.single("image"), updateUserImage);



module.exports = ownerRouter;  // Replaced export default with module.exports
