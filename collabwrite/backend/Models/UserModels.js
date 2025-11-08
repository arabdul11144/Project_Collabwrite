const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const schema = mongoose.Schema;

const userSchema = new schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    }


});

//Hash password before saving the user
userSchema.pre("save", async function (next) {
    // If password field hasn't been modified, skip hashing
    if (!this.isModified("password")) return next();

    try {
        // Generate salt (adds randomness)
        const salt = await bcrypt.genSalt(10);

        // Hash password with salt
        this.password = await bcrypt.hash(this.password, salt);

        next();
    } catch (err) {
        next(err);
    }
});


module.exports = mongoose.model("register", userSchema);

