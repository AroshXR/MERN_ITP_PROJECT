const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

// Insert user controller
const userController = require("../controllers/UserController");

// Specific routes must come before parameter routes to avoid conflicts
router.get("/", userController.getAllUsers);
router.post("/", userController.addUsers);

router.get("/me", protect, userController.getCurrentUser);
router.put("/me", protect, userController.updateCurrentUser);
router.delete("/me", protect, userController.deleteCurrentUser);

router.post("/:id/identity/submit", userController.submitIdentityVerification);
router.patch("/:id/identity-status", userController.updateIdentityStatus);

router.get("/:id/notifications", userController.getUserNotifications);
router.post("/:id/notifications", userController.createNotification);
router.patch("/:id/notifications/:notificationId", userController.updateNotification);
router.delete("/:id/notifications/:notificationId", userController.deleteNotification);

router.get("/:id", userController.getById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
