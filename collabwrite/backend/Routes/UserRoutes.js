
const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserControllers");


router.get("/", UserController.getAllUsers);
router.post("/", UserController.addUser);
router.post("/login", UserController.loginUser);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);



module.exports = router;
