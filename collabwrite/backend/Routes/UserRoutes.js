//This define a route to get all users from the DB using a controller function.

const express = require("express");
const router = express.Router();
const User = require("../Models/UserModels");
const UserController = require("../Controllers/UserControllers");

// Defining a route: When someone visits GET /, it will run the function getAllUsers() from the controller.
router.get("/", UserController.getAllUsers);
router.post("/", UserController.addUser);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);


// exporting: Makes the router available to import in your main app (like app.js).
module.exports = router;
