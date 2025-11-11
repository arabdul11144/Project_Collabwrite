const User = require("../Models/UserModels");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const LoggedInUser = require("../Models/LoggedInUser");



const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



require("dotenv").config();





const addUser = async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        // Step 1: Validate password before saving
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message:
                    "Password must contain at least 1 UPPERCASE, 1 number, and more than 5 characters",
            });
        }

        // Step 2: Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Step 3: Create new user (password will hashed automatically)
        const newUser = new User({ name, email, password });
        await newUser.save();

        // Step 4: Remove password from response
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

         // Save user name to LoggedInUser collection
        await LoggedInUser.create({ name: user.name, email: user.email });

        res.status(200).json({
            message: "Login successful!",
            user: safeUser
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};



const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            // If not, create new user
            user = await User.create({
                googleId: sub,
                name,
                email,
                password: sub + process.env.JWT_SECRET, // dummy password
                picture
            });
        }

        // Generate JWT for your app
        const myToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        await LoggedInUser.create({ name: user.name, email: user.email });


        res.status(200).json({ user, token: myToken });

    } catch (err) {
        console.error(err);
        res.status(400).json({ message: "Invalid Google token" });
    }
};





const nodemailer = require("nodemailer");

// send OTP using Mailtrap
const sendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiry for 10 minutes
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();



        // Mailtrap SMTP transporter
        // const transporter = nodemailer.createTransport({
        //     host: process.env.MAILTRAP_HOST,
        //     port: process.env.MAILTRAP_PORT,
        //     auth: {
        //         user: process.env.MAILTRAP_USER,
        //         pass: process.env.MAILTRAP_PASS
        //     }
        // });



        // nodemailer SMTP transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });




        const mailOptions = {
            from: "no-reply@collabwrite.com",
            to: email,
            subject: "Your OTP Code for Password Reset",
            text: `Your OTP is: ${otp}`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "An OTP has sent to your email" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error sending OTP" });
    }
};



// Verify OTP and reset password
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check OTP and expiry
    if (user.otp !== otp || user.otpExpiry < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Assign new password
    user.password = newPassword;

    // Clear OTP fields
    user.otp = null;
    user.otpExpiry = null;

    await user.save();
    return res.status(200).json({ message: "Password reset successful" });
};





exports.getAllUsers = getAllUsers;
exports.addUser = addUser;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.loginUser = loginUser;
exports.sendOtp = sendOtp;
exports.resetPassword = resetPassword;
exports.googleLogin = googleLogin;
