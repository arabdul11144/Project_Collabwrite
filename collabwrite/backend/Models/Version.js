const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
  docId: { type: String, required: true, index: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true }, // store Quill Delta JSON
  user: { type: String, default: "anonymous" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Version", versionSchema);
