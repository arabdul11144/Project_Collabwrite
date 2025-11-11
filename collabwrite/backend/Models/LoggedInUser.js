const mongoose = require("mongoose");

const LoggedInUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  loginTime: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LoggedInUser", LoggedInUserSchema);
