// backend/Models/QuestionModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema(
  {
    question: { type: String, required: true },
    imageUrl: { type: String }, // optional image/link
    user: { type: mongoose.Schema.Types.ObjectId, ref: "register" }, // reference to user (your model name is "register")
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
