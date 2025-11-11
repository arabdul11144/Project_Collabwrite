// backend/Models/QuestionModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema(
  {
    question: { type: String, required: true },
    imageUrl: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 👈 renamed field
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
