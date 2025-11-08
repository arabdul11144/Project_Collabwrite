
const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserControllers");

// Define routes
router.get("/", UserController.getAllUsers);
router.post("/", UserController.addUser);
router.post("/login", UserController.loginUser);
router.post("/send-otp", UserController.sendOtp);
router.post("/reset-password", UserController.resetPassword);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);



module.exports = router;
