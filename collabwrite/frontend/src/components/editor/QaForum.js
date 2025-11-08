import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import {
  ArrowUpwardOutlined,
  ArrowDownwardOutlined,
  RepeatOneOutlined,
  ChatBubbleOutlined,
  ShareOutlined,
  MoreHorizOutlined,
  NotificationsOutlined as NotificationsOutlinedIcon,
  PeopleAltOutlined as PeopleAltOutlinedIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import logo from "./logo.png";
import "./QaForum.css";

// ===== Qaheader Component =====
function Qaheader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const handleCloseIcon = <CloseIcon />;

  const inputFieldStyle = {
    margin: "5px 0",
    border: "1px solid lightgray",
    padding: "10px",
    outline: "2px solid #000",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div className="qHeader">
      <div className="qHeader-content">
        <div
          className="qHeader_logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <img src={logo} alt="logo" style={{ height: "40px" }} />
          <span
            style={{
              fontSize: "25px",
              fontWeight: "semi-bold",
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
          <Button onClick={() => setIsModalOpen(true)}>Add Questions</Button>

          <Modal
            open={isModalOpen}
            closeIcon={handleCloseIcon}
            onClose={() => setIsModalOpen(false)}
            closeOnEsc
            center
            closeOnOverlayClick={false}
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
                style={inputFieldStyle}
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
                  style={inputFieldStyle}
                  placeholder="Optional: include a link that gives context"
                />
                {inputUrl !== "" && (
                  <img
                    src={inputUrl}
                    alt="displayimage"
                    style={{
                      height: "40vh",
                      objectFit: "contain",
                      maxWidth: "100%",
                      marginTop: "10px",
                      border: "1px solid #faf8f8ff",
                      borderRadius: "4px",
                    }}
                  />
                )}
              </div>
            </div>

            <div className="modal__buttons">
              <button className="cancel" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="add">
                Add Question
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

// ===== QaBox Component =====
function QaBox() {
  return (
    <div className="quoraBox">
      <div className="quoraBox__info">
        <Avatar />
      </div>
      <div className="quoraBox__quora">
        <p>What is your question or Link?</p>
      </div>
    </div>
  );
}

// ===== Post Component =====
function Post() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answer, setAnswer] = useState("");

  const handleAddAnswer = () => {
    console.log("Answer submitted:", answer);
    setIsModalOpen(false);
    setAnswer("");
  };

  return (
    <div className="post">
      <div className="post__info">
        <Avatar />
        <h4>User Name</h4>
        <small>Timestamp</small>
      </div>

      <div className="post__body">
        <p>This is test question</p>
        <button onClick={() => setIsModalOpen(true)} className="post__btnAnswer">
          Answer
        </button>

        <Modal
          open={isModalOpen}
          closeIcon={<CloseIcon />}
          onClose={() => setIsModalOpen(false)}
          closeOnEsc
          center
          closeOnOverlayClick={false}
          styles={{ overlay: { height: "auto" } }}
        >
          <div className="modal__question">
            <h1>This is a Test Question</h1>
            <p>
              asked by <span>Username</span> on <span>timestamp</span>
            </p>
          </div>

          <div className="modal__answer">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your Answer"
              style={{
                width: "100%",
                minHeight: "150px",
                padding: "10px",
                fontSize: "16px",
                resize: "vertical",
                borderRadius: "4px",
                border: "1px solid lightgray",
                outline: "none",
              }}
            />
          </div>

          <div className="modal__buttons">
            <button className="cancel" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button className="add" onClick={handleAddAnswer} disabled={!answer.trim()}>
              Add Answer
            </button>
          </div>
        </Modal>
      </div>

      <div className="post__footer">
        <div className="post__footerAction">
          <ArrowUpwardOutlined />
          <ArrowDownwardOutlined />
        </div>
        <RepeatOneOutlined />
        <ChatBubbleOutlined />
        <div className="post__footerLeft">
          <ShareOutlined />
          <MoreHorizOutlined />
        </div>
      </div>

      <p
        style={{
          color: "rgba(0,0,0,0.5)",
          fontSize: "12px",
          fontWeight: "bold",
          margin: "10px 0",
        }}
      >
        1 Answer
      </p>

      <div
        style={{
          margin: "5px 0px 0px",
          padding: "5px 0px 0px",
          borderTop: "1px solid lightgray",
        }}
        className="post__answer"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: "10px 5px",
            borderTop: "1px solid lightgray",
          }}
          className="post-answer-container"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#888",
            }}
            className="post-answered"
          >
            <Avatar />
            <div
              style={{
                margin: "0px 10px",
              }}
              className="post-info"
            >
              <p>Username</p>
              <span>Timestamp</span>
            </div>
          </div>
          <div className="post-answer">This is test answer</div>
        </div>
      </div>
    </div>
  );
}

// ===== Feed Component =====
function Feed() {
  return (
    <div className="feed">
      <QaBox />
      <Post />
      <Post />
      <Post />
      <Post />
      <Post />
    </div>
  );
}

// ===== Main Qa Component =====
function Qa() {
  return (
    <div className="Qa">
      <Qaheader />
      <div className="qa_contents">
        <div className="qa_content">
          <Feed />
        </div>
      </div>
    </div>
  );
}

export default Qa;