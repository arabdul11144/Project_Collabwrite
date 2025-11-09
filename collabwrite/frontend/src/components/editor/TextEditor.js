import React, { useCallback, useState, useRef, useEffect } from "react";
import "./styles.css";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import "quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import htmlDocx from "html-docx-js/dist/html-docx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ShareModal from "./ShareModal";
import SharePopup from "./SharePopup";
import Chat from "./chat";
import { io } from "socket.io-client";
import "./QaForum";
import "./Chatbot";
import Delta from "quill-delta";
import Settings from "./Settings";
import Notification from "./Notification";

Quill.register("modules/cursors", QuillCursors);

// ✅ Custom HTML blot for tables
const BlockEmbed = Quill.import("blots/block/embed");
class HtmlEmbed extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.innerHTML = value;
    return node;
  }
  static value(node) {
    return node.innerHTML;
  }
}
HtmlEmbed.blotName = "html";
HtmlEmbed.tagName = "div";
Quill.register(HtmlEmbed);

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["link", "image"],
  ["clean"],
];

const dropdowns = {
  File: [
    { label: "New", action: "new" },
    { label: "Open", action: "open" },
    { label: "Save", action: "save" },
    { label: "Save As", action: "saveas" },
    { label: "Export PDF", action: "export-pdf" },
    { label: "Export DOCX", action: "export-docx" },
    { label: "Rename", action: "rename" },
  ],
  Insert: [
    { label: "Insert Image", action: "insert-image" },
    { label: "Insert Table", action: "insert-table" },
    { label: "Insert Link", action: "insert-link" },
    { label: "Horizontal Line", action: "Horizontal-line" },
  ],
  Edit: [
    { label: "Cut", action: "cut" },
    { label: "Copy", action: "copy" },
    { label: "Paste", action: "paste" },
    { label: "Add Row", action: "add-row" },
    { label: "Add Column", action: "add-column" },
    { label: "Delete Row", action: "delete-row" },
    { label: "Delete Column", action: "delete-column" },
    { label: "Delete Table", action: "delete-table" },
    { label: "Select All", action: "select-all" },
    { label: "Find & Replace", action: "find-replace" },
  ],
  View: [
    { label: "Undo", action: "undo" },
    { label: "Redo", action: "redo" },
    { label: "Word Count", action: "word-count" },
    { label: "Fullscreen", action: "fullscreen" },
    { label: "Zoom In", action: "zoom-in" },
    { label: "Zoom Out", action: "zoom-out" },
    { label: "Dark Mode", action: "dark-mode" },
  ],
};

export default function TextEditor() {
  const { id: documentId } = useParams();
  const navigate = useNavigate();

  const [quill, setQuill] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Share states
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Chat & user states
  const [showChat, setShowChat] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [chatNotification, setChatNotification] = useState(0);

  // Auto-save & history
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(new Date());
  const [versionHistory, setVersionHistory] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Notification & settings
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationsData] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const notifRef = useRef(null);
  const notificationBtnRef = useRef(null);
  const socket = useRef();

  const getUserColor = (userName) => {
    const colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#FF8C00"];
    const index = userName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // ✅ Initialize user name
  useEffect(() => {
    let userName = localStorage.getItem("textEditor_userName");
    if (!userName) {
      userName = `User_${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem("textEditor_userName", userName);
    }
    setCurrentUser(userName);
  }, []);

  // ✅ Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showNotification &&
        notifRef.current &&
        !notifRef.current.contains(e.target) &&
        notificationBtnRef.current &&
        !notificationBtnRef.current.contains(e.target)
      ) {
        setShowNotification(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotification]);

  // ✅ Quill setup
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS, cursors: true },
    });

    const clipboard = q.getModule("clipboard");
    clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      if (node.tagName === "TABLE") {
        const tableHTML = node.outerHTML;
        return new Delta().insert({ html: tableHTML });
      }
      return delta;
    });

    setQuill(q);
  }, []);

  const toggleDropdown = (menu) => {
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) setChatNotification(0);
  };

  // ✅ Save version
  const saveVersion = (content) => {
    const version = {
      id: Date.now(),
      content: content,
      timestamp: new Date(),
      user: currentUser,
    };
    setVersionHistory((prev) => [version, ...prev.slice(0, 9)]);
  };

  // ✅ Socket & collaboration setup
  useEffect(() => {
    if (!quill || !currentUser) return;
    socket.current = io("http://localhost:5000");

    socket.current.emit("join-document", documentId);
    socket.current.emit("user-join", { user: currentUser });

    const cursors = quill.getModule("cursors");
    quill.on("selection-change", (range) => {
      if (!range) return;
      socket.current.emit("cursor-move", { user: currentUser, range });
    });

    socket.current.on("cursor-update", ({ user, range, color }) => {
      if (user === currentUser) return;
      cursors.createCursor(user, user, color);
      cursors.moveCursor(user, range);
    });

    socket.current.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
      setAutoSaveStatus("saved");
    });

    const handleChange = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.current.emit("send-changes", delta);
      setAutoSaveStatus("saving");
    };
    quill.on("text-change", handleChange);

    socket.current.on("receive-changes", (delta) => {
      const currentSelection = quill.getSelection();
      quill.updateContents(delta);
      if (currentSelection) quill.setSelection(currentSelection);
    });

    socket.current.on("new-message", (message) => {
      if (!showChat && message.user !== currentUser) {
        setChatNotification((prev) => prev + 1);
      }
    });

    const interval = setInterval(() => {
      const content = quill.getContents();
      socket.current.emit("save-document", {
        docId: documentId,
        data: content,
      });
      if (Date.now() - lastSaved.getTime() > 60000) {
        saveVersion(content);
        setLastSaved(new Date());
      }
      setAutoSaveStatus("saved");
    }, 2000);

    socket.current.on("save-error", () => {
      setAutoSaveStatus("error");
    });

    return () => {
      clearInterval(interval);
      socket.current.off("receive-changes");
      socket.current.off("new-message");
      socket.current.off("save-error");
      quill.off("text-change", handleChange);
      socket.current.disconnect();
    };
  }, [quill, documentId, currentUser, showChat, lastSaved]);

  // ✅ File Upload
  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      quill.root.innerHTML = reader.result;
    };
    reader.readAsText(e.target.files[0]);
  };

  // ✅ Document actions
  const handleAction = (action) => {
    setOpenDropdown(null);
    if (!quill) return;

    switch (action) {
      case "new":
        if (window.confirm("Create new document?")) quill.setText("");
        break;
      case "open":
        document.getElementById("fileInput").click();
        break;
      case "save":
        saveAs(
          new Blob([quill.getText()], { type: "text/plain;charset=utf-8" }),
          "document.txt"
        );
        break;
      case "saveas":
        saveAs(
          new Blob([quill.root.innerHTML], { type: "text/html;charset=utf-8" }),
          "document.html"
        );
        break;
      case "export-pdf":
        html2canvas(quill.root).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const width = pdf.internal.pageSize.getWidth();
          const height = (canvas.height * width) / canvas.width;
          pdf.addImage(imgData, "PNG", 0, 0, width, height);
          pdf.save("document.pdf");
        });
        break;
      case "export-docx":
        const docxHtml = `<html><body>${quill.root.innerHTML}</body></html>`;
        const docxBlob = htmlDocx.asBlob(docxHtml);
        saveAs(docxBlob, "document.docx");
        break;
      case "rename":
        const newTitle = prompt("Enter new document title:");
        if (newTitle) document.title = newTitle;
        break;
      default:
        alert("Coming soon...");
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="dropdown-menu">
          <img src="/logo.png" alt="Logo" className="logo-img" />
          {Object.entries(dropdowns).map(([menu, actions]) => (
            <div key={menu} className="dropdown">
              <button onClick={() => toggleDropdown(menu)} className="dropbtn">
                {menu}
              </button>
              {openDropdown === menu && (
                <div className="dropdown-content">
                  {actions.map(({ label, action }) => (
                    <div
                      key={action}
                      onClick={() => handleAction(action)}
                      className="dropdown-item"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="auto-save-status">
          <span className={`status-indicator ${autoSaveStatus}`}>
            {autoSaveStatus === "saving" && "💾 Saving..."}
            {autoSaveStatus === "saved" && "✅ Saved"}
            {autoSaveStatus === "error" && "⚠️ Error"}
          </span>
        </div>

        <div className="topbar-actions">
          <button className="action-btn" onClick={() => navigate("/bot")}>
            🤖 AI
          </button>
          <button className="action-btn" onClick={() => navigate("/qa")}>
            ❓ QA
          </button>
          <button
            className="action-btn"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
          >
            📚 History
          </button>
          <button
            className="action-btn"
            onClick={() => setShowNotification((prev) => !prev)}
          >
            🔔 Notification
          </button>

          {/* ✅ Share Button + Popup */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <button
              className="action-btn"
              onClick={() => setShowSharePopup(!showSharePopup)}
            >
              📤 Share
            </button>

            {showSharePopup && (
              <div className="share-box">
                <h4 className="share-title">📤 Share Document</h4>

                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/documents/${documentId}`}
                  onClick={(e) => e.target.select()}
                  className="share-input"
                />

                <div className="share-actions">
                  <button
                    className={`btn-copy ${copySuccess ? "copied" : ""}`}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/documents/${documentId}`
                      );
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy"}
                  </button>

                  <button
                    className="btn-more"
                    onClick={() => {
                      setShowSharePopup(false);
                      setShowShareModal(true);
                    }}
                  >
                    ⚙️ More Options
                  </button>

                  <button
                    className="btn-close"
                    onClick={() => setShowSharePopup(false)}
                  >
                    ✖ Close
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="action-btn">👥 Participate</button>
          <button
            className="action-btn settings-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ Setting
          </button>
        </div>
      </header>

      <input
        type="file"
        accept=".txt,.html"
        id="fileInput"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      <div className="main-content">
        <div
          className="container editor-container"
          ref={wrapperRef}
          style={{ marginRight: showChat ? "350px" : "0px" }}
        />

        <div className={`chat-sidebar ${showChat ? "chat-open" : ""}`}>
          {showChat && currentUser && (
            <Chat
              roomId={documentId}
              user={currentUser}
              socket={socket.current}
            />
          )}
        </div>
      </div>

      {/* ✅ Share Modal */}
      {showShareModal && (
        <ShareModal
          documentId={documentId}
          documentTitle={document.title || "Untitled Document"}
          onClose={() => setShowShareModal(false)}
          onShareSuccess={() => setShowShareModal(false)}
        />
      )}

      <Settings show={showSettings} onClose={() => setShowSettings(false)} />
      <Notification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        notifications={notificationsData}
      />
    </>
  );
}
