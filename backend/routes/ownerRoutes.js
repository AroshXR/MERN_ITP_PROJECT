const express = require("express");  // Replaced import with require
const { protect } = require("../middleware/auth");  // Replaced import with require
const { changeRoleToOwner, addOutfit, getOwnerOutfits, toggleOutfitAvailability, deleteOutfit, getDashboardData, updateUserImage } = require("../controllers/ownerController");  // Replaced import with require
const upload = require("../middleware/multer");

const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleToOwner);
ownerRouter.post("/add-outfit", upload.single("image"),protect, addOutfit);
ownerRouter.get("/outfits", protect, getOwnerOutfits);
ownerRouter.post("/toggle-outfit", protect, toggleOutfitAvailability);
ownerRouter.post("/delete-outfit", protect, deleteOutfit);

ownerRouter.get("/dashboard", protect, getDashboardData);
ownerRouter.post("/update-image", upload.single("image"),protect, updateUserImage);



module.exports = ownerRouter;  // Replaced export default with module.exports
