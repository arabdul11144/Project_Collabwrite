// backend/Models/AnswerModel.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const answerSchema = new Schema(
  {
    answer: { type: String, required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "register" }, // reference to user
  },
  { timestamps: true }
);

module.exports = mongoose.model("Answer", answerSchema);
