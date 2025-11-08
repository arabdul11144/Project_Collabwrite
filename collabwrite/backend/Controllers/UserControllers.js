const User = require("../Models/UserModels");
const bcrypt = require("bcryptjs");


//Data insert
// const addUser = async (req, res, next) => {
//     const { name, email, password } = req.body;
//     let users;
//     try {
//         users = new User({
//             name,
//             email,
//           password
//         });
//         await users.save();
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ message: "Server error" });
//     }
//     if (!users) {
//         return res.status(400).json({ message: "unable to add user" });
//     }
//     return res.status(201).json({ users });
// };
const addUser = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Create new user (password will be hashed automatically)
        const newUser = new User({ name, email, password });
        await newUser.save();

        // Don’t send password back in response
        const { password: _, ...userWithoutPassword } = newUser._doc;

        return res.status(201).json({
            message: "User registered successfully!",
            user: userWithoutPassword
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};



//Data Display
// const getAllUsers = async (req, res, next) => {
//     let users;
//     try {
//         users = await User.find();
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ message: "Server error" });
//     }
//     if (!users || users.length === 0) {
//         return res.status(404).json({ message: "No users found" });
//     }

//     return res.status(200).json({ users });
// };
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password"); // exclude password field

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        return res.status(200).json({ users });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};



//Get by ID
// const getById = async (req, res, next) => {
//     const id = req.params.id;
//     let users;
//     try {
//         users = await User.findById(id);
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ message: "Server error" });
//     }
//     if (!users) {
//         return res.status(404).json({ message: "user not found" });
//     }
//     return res.status(200).json({ users });
// };

const getById = async (req, res, next) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id).select("-password"); // exclude password

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
};



//update user details
// const updateUser = async (req, res, next) => {
//     const id = req.params.id;
//     const { name, email, password } = req.body;
//     let users;

//     try {
//         users = await User.findByIdAndUpdate(id, { name: name, email: email, password: password });
//         // users = await User.save();
//         users = await User.findByIdAndUpdate(id, { name, email, password }, { new: true });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ message: "Server error" });
//     }
//     if (!users) {
//         return res.status(404).json({ message: "unable to update user details" });
//     }
//     return res.status(200).json({ users });
// };

const updateUser = async (req, res, next) => {
    const id = req.params.id;
    const { name, email, password } = req.body;

    try {
        // If password is being updated, hash it
        let updatedData = { name, email };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updatedData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updatedData, { new: true }).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "Unable to update user details" });
        }

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error" });
    }
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



//User Login
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare entered password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Exclude password before sending back user info
        const { password: _, ...safeUser } = user._doc;

        res.status(200).json({
            message: "Login successful!",
            user: safeUser
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};




exports.getAllUsers = getAllUsers;
exports.addUser = addUser;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.loginUser = loginUser;
