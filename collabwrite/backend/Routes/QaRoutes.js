// backend/Routes/QaRoutes.js
const express = require("express");
const router = express.Router();
const QaController = require("../Controllers/QaController");

// ---------- Question Endpoints ----------
router.post("/add-question", QaController.addQuestion);
router.get("/get-questions", QaController.getQuestions);
router.delete("/question/:id", QaController.deleteQuestion); // delete question + its answers

// ---------- Answer Endpoints ----------
router.post("/add-answer", QaController.addAnswer);
router.get("/get-answers/:id", QaController.getAnswersByQuestion);
router.delete("/answer/:id", QaController.deleteAnswer); // delete single answer

module.exports = router;
