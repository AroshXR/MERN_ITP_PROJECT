const express = require("express");
const router = express.Router();

//insert model
const User = require("../models/User");

//insert user controller
const userController = require("../controllers/UserController");

router.get("/" , userController.getAllUsers);
router.post("/" , userController.addUsers);
router.get("/:id" , userController.getById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

//export
module.exports = router;