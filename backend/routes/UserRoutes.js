const express = require("express");
const router = express.Router();

//insert model
const User = require("../models/User");

//insert user controller
const userController = require("../controllers/UserController");

// Import authentication middleware (temporarily disabled)
// const { protect } = require("../middleware/auth");

router.get("/" , userController.getAllUsers);
router.post("/" , userController.addUsers);
router.get("/:id" , userController.getById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// Token verification endpoint (temporarily disabled)
// router.get("/verify-token", protect, async (req, res) => {
//     try {
//         console.log('Token verification request received');
//         console.log('User from token:', req.user);
//         
//         // If we reach here, the token is valid and user is attached to req.user
//         res.status(200).json({
//             status: "ok",
//             user: req.user
//         });
//     } catch (error) {
//         console.error('Token verification error:', error);
//         res.status(401).json({
//             status: "error",
//             message: "Token verification failed"
//         });
//     }
// });

//export
module.exports = router;