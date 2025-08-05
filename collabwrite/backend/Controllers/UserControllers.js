const User = require("../Models/UserModels");

//Data Display
const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ users });
};


//Data insert
const addUser = async (req, res, next) => {
    const { name, gmail, age, address } = req.body;
    let users;
    try {
        users = new User ({
            name,
            gmail,
            age,
            address
        });
        await users.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    if (!users) {
        return res.status(400).json({ message: "unable to add user" });
    }
    return res.status(201).json({ users });
};


//Get by ID
const getById = async (req, res, next) => {
    const id = req.params.id;
    let users;
    try {
        users = await User.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    if (!users) {
        return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json({ users });
};


//update user details
const updateUser = async (req, res, next) => {
    const id = req.params.id;
    const { name, gmail, age, address } = req.body;
    let users;

    try {
        users = await User.findByIdAndUpdate(id, { name: name, gmail: gmail, age: age, address: address });
        users = await User.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    if (!users) {
        return res.status(404).json({ message: "unable to update user details" });
    }
    return res.status(200).json({ users });
};


//delete user details
const deleteUser = async (req, res, next) => {
    const id = req.params.id;
    let users;
    try {
        users = await User.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
    if (!users) {
        return res.status(404).json({ message: "unable to delete user" });
    }
    return res.status(200).json({ message: "user deleted successfully" });
};



exports.getAllUsers = getAllUsers;
exports.addUser = addUser;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
