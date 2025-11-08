// src/components/editor/QaForum.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import {
  ArrowUpwardOutlined,
  ArrowDownwardOutlined,
  ShareOutlined,
  MoreHorizOutlined,
  NotificationsOutlined as NotificationsOutlinedIcon,
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import logo from "./logo.png";
import "./QaForum.css";

const API_BASE = "http://localhost:5000/api/qa";

// helper: get current user from localStorage (expected after login)
const getCurrentUser = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user"));
    return u;
  } catch (e) {
    return null;
  }
};

// ===== Qaheader Component =====
function Qaheader({ onAddQuestion }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [inputUrl, setInputUrl] = useState("");

  const currentUser = getCurrentUser();

  const handleAddQuestion = async () => {
    if (!questionText.trim()) return alert("Please enter a question");

    try {
      await axios.post(`${API_BASE}/add-question`, {
        question: questionText,
        imageUrl: inputUrl,
        userId: currentUser ? currentUser._id : null,
      });
      onAddQuestion();
      setQuestionText("");
      setInputUrl("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding question:", error);
      alert("Failed to add question");
    }
  };

  return (
    <div className="qHeader">
      <div className="qHeader-content">
        <div
          className="qHeader_logo"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <img src={logo} alt="logo" style={{ height: "40px" }} />
          <span
            style={{
              fontSize: "25px",
              fontWeight: "600",
              color: "#ffffffff",
              letterSpacing: "1px",
            }}
          >
            QaForum
          </span>
        </div>

        <div className="qHeader__input">
          <SearchIcon />
          <input type="text" placeholder="Search questions" />
        </div>

        <div className="qHeader_Rem">
          <Avatar />
        </div>

        <div className="qHeader__icon">
          <NotificationsOutlinedIcon />
        </div>

        <div className="qHeader_button">
          <Button onClick={() => setIsModalOpen(true)}>Add Question</Button>

          <Modal
            open={isModalOpen}
            closeIcon={<CloseIcon />}
            onClose={() => setIsModalOpen(false)}
            center
            styles={{ overlay: { height: "auto" } }}
          >
            <div className="modal__title">
              <h5>Add Question</h5>
              <h5>Share Link</h5>
            </div>

            <div className="modal__info">
              <Avatar className="avatar" />
              <div className="modal__scope">
                <PeopleAltOutlinedIcon />
                <p>Public</p>
                <ExpandMoreIcon />
              </div>
            </div>

            <div className="modal__Field">
              <input
                type="text"
                placeholder="Start your question with 'What', 'Why', 'How', etc..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                style={{
                  margin: "5px 0",
                  border: "1px solid lightgray",
                  padding: "10px",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  maxWidth: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Optional: include an image/link that gives context"
                  style={{
                    margin: "5px 0",
                    border: "1px solid lightgray",
                    padding: "10px",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {inputUrl && (
                  <img
                    src={inputUrl}
                    alt="display"
                    className="question__imagePreview"
                  />
                )}
              </div>
            </div>

            <div className="modal__buttons">
              <button className="cancel" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="add" onClick={handleAddQuestion}>
                Add Question
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

// ===== Post Component =====
function Post({ question, onQuestionDeleted }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const currentUser = getCurrentUser();

  const fetchAnswers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get-answers/${question._id}`);
      setAnswers(res.data || []);
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };

  const handleAddAnswer = async () => {
    if (!answer.trim()) return alert("Please enter an answer");
    try {
      await axios.post(`${API_BASE}/add-answer`, {
        questionId: question._id,
        answer,
        userId: currentUser ? currentUser._id : null,
      });
      setAnswer("");
      setIsModalOpen(false);
      fetchAnswers();
    } catch (error) {
      console.error("Error adding answer:", error);
      alert("Failed to add answer");
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm("Delete this answer?")) return;
    try {
      await axios.delete(`${API_BASE}/answer/${answerId}`);
      fetchAnswers();
    } catch (error) {
      console.error("Error deleting answer:", error);
      alert("Failed to delete answer");
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm("Delete this question and all its answers?")) return;
    try {
      await axios.delete(`${API_BASE}/question/${question._id}`);
      onQuestionDeleted();
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question");
    }
  };

  useEffect(() => {
    fetchAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="post" style={{ marginBottom: 20 }}>
      <div
        className="post__info"
        style={{ display: "flex", alignItems: "center", gap: 10 }}
      >
        <Avatar />
        <div>
          <h4 style={{ margin: 0 }}>{question.user?.name || "Anonymous"}</h4>
          <small style={{ color: "#666" }}>
            {new Date(question.createdAt).toLocaleString()}
          </small>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Button
            onClick={handleDeleteQuestion}
            title="Delete question"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="post__body">
        <p>{question.question}</p>
        {question.imageUrl && (
          <img
            src={question.imageUrl}
            alt="context"
            className="question__imageDisplay"
          />
        )}

        <button
          onClick={() => setIsModalOpen(true)}
          className="post__btnAnswer"
        >
          Answer
        </button>

        <Modal
          open={isModalOpen}
          closeIcon={<CloseIcon />}
          onClose={() => setIsModalOpen(false)}
          center
          styles={{ overlay: { height: "auto" } }}
        >
          <div className="modal__question">
            <h1>{question.question}</h1>
            <p>
              asked by <strong>{question.user?.name || "User"}</strong>
            </p>
          </div>

          <div className="modal__answer">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your Answer"
              style={{
                width: "100%",
                minHeight: 150,
                padding: 10,
                fontSize: 16,
                borderRadius: 4,
                border: "1px solid lightgray",
              }}
            />
          </div>

          <div className="modal__buttons">
            <button className="cancel" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button
              className="add"
              onClick={handleAddAnswer}
              disabled={!answer.trim()}
            >
              Add Answer
            </button>
          </div>
        </Modal>
      </div>

      <div className="post__footer" style={{ marginTop: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <ArrowUpwardOutlined />
          <ArrowDownwardOutlined />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <ShareOutlined />
          <MoreHorizOutlined />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <p
          style={{
            color: "rgba(0,0,0,0.5)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {answers.length} Answer(s)
        </p>

        {answers.map((ans) => (
          <div
            key={ans._id}
            style={{ borderTop: "1px solid lightgray", padding: 10 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar />
                <div>
                  <p style={{ margin: 0 }}>{ans.user?.name || "User"}</p>
                  <small style={{ color: "#666" }}>
                    {new Date(ans.createdAt).toLocaleString()}
                  </small>
                </div>
              </div>
              <div>
                <Button
                  onClick={() => handleDeleteAnswer(ans._id)}
                  title="Delete answer"
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>{ans.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Feed Component =====
function Feed({ refreshKey, onQuestionDeleted }) {
  const [questions, setQuestions] = useState([]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get-questions`);
      setQuestions(res.data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [refreshKey]);

  return (
    <div className="feed">
      {questions.length === 0 ? (
        <p>No questions yet.</p>
      ) : (
        questions.map((q) => (
          <Post
            key={q._id}
            question={q}
            onQuestionDeleted={onQuestionDeleted}
          />
        ))
      )}
    </div>
  );
}

// ===== Main Qa Component =====
function Qa() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="Qa">
      <Qaheader onAddQuestion={handleRefresh} />
      <div className="qa_contents">
        <div className="qa_content">
          <Feed refreshKey={refreshKey} onQuestionDeleted={handleRefresh} />
        </div>
      </div>
    </div>
  );
}

export default Qa;
