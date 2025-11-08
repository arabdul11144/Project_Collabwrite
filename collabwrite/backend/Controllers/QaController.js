// backend/Controllers/QaController.js
const Question = require("../Models/QuestionModel");
const Answer = require("../Models/AnswerModel");

// ===================== Add Question =====================
exports.addQuestion = async (req, res) => {
  try {
    const { question, imageUrl, userId } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ message: "Question text is required" });
    }

    const newQuestion = new Question({
      question: question.trim(),
      imageUrl: imageUrl || "",
      user: userId || null,
    });

    await newQuestion.save();
    const populated = await Question.findById(newQuestion._id).populate("user", "name email");
    return res.status(201).json({ message: "Question added", question: populated });
  } catch (err) {
    console.error("addQuestion error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== Get All Questions =====================
exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(questions);
  } catch (err) {
    console.error("getQuestions error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== Add Answer =====================
exports.addAnswer = async (req, res) => {
  try {
    const { answer, questionId, userId } = req.body;
    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: "Answer text is required" });
    }
    if (!questionId) {
      return res.status(400).json({ message: "questionId is required" });
    }

    const newAnswer = new Answer({
      answer: answer.trim(),
      questionId,
      user: userId || null,
    });

    await newAnswer.save();
    const populated = await Answer.findById(newAnswer._id).populate("user", "name email");
    return res.status(201).json({ message: "Answer added", answer: populated });
  } catch (err) {
    console.error("addAnswer error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== Get Answers for Question =====================
exports.getAnswersByQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    const answers = await Answer.find({ questionId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(answers);
  } catch (err) {
    console.error("getAnswersByQuestion error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== Delete a Specific Answer =====================
exports.deleteAnswer = async (req, res) => {
  try {
    const answerId = req.params.id;
    console.log("🗑️ Delete request for answer:", answerId); // debug log

    if (!answerId) {
      return res.status(400).json({ message: "Answer ID is required" });
    }

    const deleted = await Answer.findByIdAndDelete(answerId);
    if (!deleted) return res.status(404).json({ message: "Answer not found" });

    console.log("✅ Answer deleted:", answerId);
    return res.status(200).json({ message: "Answer deleted", answerId });
  } catch (err) {
    console.error("deleteAnswer error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ===================== Delete a Question & Its Answers =====================
exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;
    console.log("🗑️ Delete request for question:", questionId); // debug log

    if (!questionId) {
      return res.status(400).json({ message: "Question ID is required" });
    }

    const question = await Question.findByIdAndDelete(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    await Answer.deleteMany({ questionId });

    console.log("✅ Question and related answers deleted:", questionId);
    return res.status(200).json({ message: "Question and its answers deleted", questionId });
  } catch (err) {
    console.error("deleteQuestion error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
