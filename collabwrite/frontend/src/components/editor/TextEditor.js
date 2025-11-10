// TextEditor_Final.js
import React, { useCallback, useState, useRef, useEffect } from "react";
import "./styles.css";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import "quill/dist/quill.snow.css";
import { useParams, useNavigate, useLocation } from "react-router-dom";

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

  // Quill instance
  const [quill, setQuill] = useState(null);

  // UI states
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false); // full popup
  const [copySuccess, setCopySuccess] = useState(false);

  // Chat & users
  const [showChat, setShowChat] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [chatNotification, setChatNotification] = useState(0);
  const [chatReady, setChatReady] = useState(false);

  // Auto-save & versions
  const [autoSaveStatus, setAutoSaveStatus] = useState("saved");
  const [lastSaved, setLastSaved] = useState(new Date());
  const [versionHistory, setVersionHistory] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Notifications & settings
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationsData] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  // Refs
  const notifRef = useRef(null);
  const notificationBtnRef = useRef(null);
  const shareBtnRef = useRef(null);
  const dropdownRef = useRef(null);
  const socket = useRef();

  const location = useLocation();
const [templateContent, setTemplateContent] = useState(null);


  // Color utility for cursors
  const getUserColor = (userName) => {
    const colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#FF8C00"];
    const index = (userName && userName.charCodeAt(0)) ? userName.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Initialize/persist username
  useEffect(() => {
    let userName = localStorage.getItem("textEditor_userName");
    if (!userName) {
      userName = `User_${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem("textEditor_userName", userName);
    }
    setCurrentUser(userName);
  }, []);




  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const templateFile = params.get("template");

  if (!templateFile) return;

  console.log("Loading template:", templateFile);

  // fetch file from /public/templates/
  fetch(`/templates/${templateFile}`)
    .then((res) => {
      if (!res.ok) throw new Error("Template not found");
      return res.text();
    })
    .then((html) => {
      console.log("Template loaded successfully");
      setTemplateContent(html); // store in state
    })
    .catch((err) => {
      console.error("Failed to load template:", err);
      setTemplateContent("<p>// Template not found</p>");
    });
}, [location.search]);


useEffect(() => {
  if (!quill || !templateContent) return;

  const timer = setTimeout(() => {
    try {
      quill.setContents([]); // clear any previous content
      quill.clipboard.dangerouslyPasteHTML(templateContent);
      console.log("✅ Template inserted into editor");
    } catch (err) {
      console.error("❌ Failed to insert template:", err);
      quill.setText("Error loading template");
    }
  }, 500); // wait a bit for Quill to fully initialize

  return () => clearTimeout(timer);
}, [quill, templateContent]);





  // Close notification when clicking outside
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

  // Delete a notification by id and section (new/old)
  const handleDelete = (section, id) => {
    setNotifications((prev) => ({
      ...prev,
      [section]: prev[section].filter((n) => n.id !== id),
    }));
  };

  // Quill wrapper setup
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        cursors: true,
      },
    });

    // Clipboard matcher — keep tables as raw HTML embed
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

  // Dropdown toggle
  const toggleDropdown = (menu) => {
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  // Toggle chat sidebar
  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) setChatNotification(0);
  };

  // Save version to history (keep last 10)
  const saveVersion = (content) => {
    const version = {
      id: Date.now(),
      content,
      timestamp: new Date(),
      user: currentUser || "Unknown",
    };
    setVersionHistory((prev) => [version, ...prev.slice(0, 9)]);
  };

  // Socket.IO collaboration + autosave + listeners
  useEffect(() => {
    if (!quill || !currentUser) return;
    socket.current = io("http://localhost:5000");

    // join document + announce user
    socket.current.emit("join-document", documentId);
    socket.current.emit("user-join", { user: currentUser });

    const cursors = quill.getModule("cursors");

    // Broadcast cursor movement
    quill.on("selection-change", (range) => {
      if (!range) return;
      socket.current.emit("cursor-move", { user: currentUser, range });
    });

    // Handle incoming cursor updates
    socket.current.on("cursor-update", ({ user, range, color }) => {
      if (user === currentUser) return;
      try {
        // create cursor if not present
        if (!cursors.cursors[user]) {
          cursors.createCursor(user, user, color || getUserColor(user));
        }
        cursors.moveCursor(user, range);
        // set the label background color if present
        const cursorElement = document.querySelector(`.ql-cursor[data-id="${user}"] .ql-cursor-name`);
        if (cursorElement && color) {
          cursorElement.style.backgroundColor = color;
          cursorElement.style.setProperty("--cursor-color", color);
        }
      } catch (err) {
        // ignore cursor errors
        // console.warn("cursor-update error", err);
      }
    });

    // load initial content
    socket.current.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
      setAutoSaveStatus("saved");
    });

    // text-change handler to broadcast edits
    const handleChange = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.current.emit("send-changes", delta);
      setAutoSaveStatus("saving");
    };
    quill.on("text-change", handleChange);

    // receive remote changes
    socket.current.on("receive-changes", (delta) => {
      const currentSelection = quill.getSelection();
      quill.updateContents(delta);
      if (currentSelection) quill.setSelection(currentSelection);
    });

    // chat notification
    socket.current.on("new-message", (message) => {
      if (!showChat && message.user !== currentUser) {
        setChatNotification((prev) => prev + 1);
      }
    });

    // periodic autosave + versioning
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

    // save error
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

  // File upload (HTML or text)
  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (!quill) return;
      quill.root.innerHTML = reader.result;
    };
    reader.readAsText(e.target.files[0]);
  };

  // Document actions (menu)
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
        saveAs(new Blob([quill.getText()], { type: "text/plain;charset=utf-8" }), "document.txt");
        break;
      case "saveas":
        saveAs(new Blob([quill.root.innerHTML], { type: "text/html;charset=utf-8" }), "document.html");
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

      // Insert image
      case "insert-image": {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = () => {
          const file = input.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            const range = quill.getSelection();
            quill.insertEmbed(range?.index || 0, "image", e.target.result);
          };
          reader.readAsDataURL(file);
        };
        input.click();
        break;
      }

      // Insert link
      case "insert-link": {
        const range = quill.getSelection(true);
        if (!range) {
          alert("Please place your cursor where you want to insert the link.");
          break;
        }
        const url = prompt("Enter the URL (e.g., https://example.com):");
        if (!url) break;
        const text = prompt("Enter display text for the link:") || url;
        quill.insertText(range.index, text, "link", url);
        quill.setSelection(range.index + text.length, 0);
        break;
      }

      // Insert table (as raw HTML embed)
      case "insert-table": {
        const range = quill.getSelection(true);
        const tableHTML = `
    <table style="width:80%, hight:40%; border-collapse: collapse;">
      <tr>
        <th style="border:2px solid #141313ff; padding:16px;">Heading</th>
        <th style="border:2px solid #040404ff; padding:16px;">Heading</th>
      </tr>
      <tr>
        <td style="border:2px solid #090808ff; padding:8px;">Data</td>
        <td style="border:2px solid #161515ff; padding:8px;">Data</td>
      </tr>
       <tr>
        <td style="border:2px solid #000000ff; padding:8px;">Data</td>
        <td style="border:2px solid #020202ff; padding:8px;">Data</td>
      </tr>
       <tr>
        <td style="border:2px solid #060505ff; padding:8px;">Data</td>
        <td style="border:2px solid #161515ff; padding:8px;">Data</td>
      </tr>
    </table><br/>
  `;
        quill.insertEmbed(range.index, "html", tableHTML);
        break;
      }

      case "add-row": {
        const table = quill.root.querySelector("table:last-of-type");
        if (!table) {
          alert("No table found. Insert a table first!");
          break;
        }
        const cols = table.rows[0]?.cells.length || 2;
        const newRow = table.insertRow(-1);
        for (let i = 0; i < cols; i++) {
          const cell = newRow.insertCell(i);
          cell.style.border = "2px solid #1c1c1cff";
          cell.style.padding = "8px";
          cell.innerText = " ";
        }
        break;
      }

      case "add-column": {
        const table = quill.root.querySelector("table:last-of-type");
        if (!table) {
          alert("No table found. Insert a table first!");
          break;
        }
        for (let row of table.rows) {
          const newCell = row.insertCell(-1);
          newCell.style.border = "2px solid #1c1b1bff";
          newCell.style.padding = "8px";
          newCell.innerText = " ";
        }
        break;
      }

      case "delete-row": {
        const table = quill.root.querySelector("table:last-of-type");
        if (!table) {
          alert("No table found. Insert a table first!");
          break;
        }
        if (table.rows.length > 1) {
          table.deleteRow(-1);
        } else {
          alert("Cannot delete the last remaining row!");
        }
        break;
      }

      case "delete-column": {
        const table = quill.root.querySelector("table:last-of-type");
        if (!table) {
          alert("No table found. Insert a table first!");
          break;
        }
        const cols = table.rows[0]?.cells.length || 0;
        if (cols <= 1) {
          alert("Cannot delete the last remaining column!");
          break;
        }
        for (let row of table.rows) {
          row.deleteCell(-1);
        }
        break;
      }

      case "delete-table": {
        const table = quill.root.querySelector("table:last-of-type");
        if (!table) {
          alert("No table found to delete!");
          break;
        }
        table.remove();
        break;
      }

      case "Horizontal-line": {
        const range = quill.getSelection(true);
        quill.clipboard.dangerouslyPasteHTML(
          range?.index || quill.getLength(),
          "<hr style='border: 2px solid #000000ff; margin: 12px 0;'/>"
        );
        break;
      }

      case "undo":
        quill.history.undo();
        break;
      case "redo":
        quill.history.redo();
        break;
      case "cut":
      case "copy":
      case "paste":
        document.execCommand(action);
        break;
      case "select-all":
        quill.setSelection(0, quill.getLength());
        break;
      case "find-replace": {
        const find = prompt("Find:");
        if (!find) return;
        const replace = prompt("Replace with:");
        quill.setText(quill.getText().replaceAll(find, replace));
        break;
      }
      case "word-count":
        alert(`Words: ${quill.getText().trim().split(/\s+/).length}`);
        break;
      case "fullscreen":
        document.documentElement.requestFullscreen();
        break;
      case "zoom-in":
        quill.root.style.fontSize = "1.5em";
        break;
      case "zoom-out":
        quill.root.style.fontSize = "1em";
        break;
      case "dark-mode":
        document.body.classList.toggle("dark-mode");
        break;
      default:
        alert("Coming soon...");
    }
  };

  // Restore a saved version
  const restoreVersion = (version) => {
    if (window.confirm(`Restore version from ${version.timestamp.toLocaleString()}?`)) {
      quill.setContents(version.content);
      setShowVersionHistory(false);
    }
  };

  // Image floating toolbar + resize handles
  useEffect(() => {
    if (!quill) return;

    let toolbar = null;
    let currentImg = null;
    let resizeHandles = [];

    const removeResizeHandles = () => {
      resizeHandles.forEach((h) => h.remove());
      resizeHandles = [];
    };

    const createResizeHandles = (img) => {
      const positions = ["tl", "tr", "bl", "br"];
      positions.forEach((pos) => {
        const handle = document.createElement("div");
        handle.classList.add("resize-handle", pos);
        document.body.appendChild(handle);

        const updateHandlePosition = () => {
          const rect = img.getBoundingClientRect();
          const offsetX = window.scrollX;
          const offsetY = window.scrollY;

          if (pos === "tl") {
            handle.style.top = `${offsetY + rect.top - 5}px`;
            handle.style.left = `${offsetX + rect.left - 5}px`;
          } else if (pos === "tr") {
            handle.style.top = `${offsetY + rect.top - 5}px`;
            handle.style.left = `${offsetX + rect.right - 5}px`;
          } else if (pos === "bl") {
            handle.style.top = `${offsetY + rect.bottom - 5}px`;
            handle.style.left = `${offsetX + rect.left - 5}px`;
          } else if (pos === "br") {
            handle.style.top = `${offsetY + rect.bottom - 5}px`;
            handle.style.left = `${offsetX + rect.right - 5}px`;
          }
        };

        updateHandlePosition();

        handle.onmousedown = (e) => {
          e.preventDefault();
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = img.offsetWidth;
          const startHeight = img.offsetHeight;

          const onMouseMove = (eMove) => {
            let newWidth = startWidth + (eMove.clientX - startX);
            let newHeight = startHeight + (eMove.clientY - startY);

            if (pos === "tl" || pos === "bl") newWidth = startWidth - (eMove.clientX - startX);
            if (pos === "tl" || pos === "tr") newHeight = startHeight - (eMove.clientY - startY);

            if (newWidth > 50 && newHeight > 50) {
              img.style.width = `${newWidth}px`;
              img.style.height = `${newHeight}px`;
              updateHandlePosition();
            }
          };

          const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
          };

          document.addEventListener("mousemove", onMouseMove);
          document.addEventListener("mouseup", onMouseUp);
        };

        resizeHandles.push(handle);
      });
    };

    const showImageToolbar = (img) => {
      if (toolbar) toolbar.remove();
      removeResizeHandles();

      currentImg = img;
      createResizeHandles(img);

      toolbar = document.createElement("div");
      toolbar.className = "image-toolbar";

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️ Edit";
      editBtn.onclick = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = () => {
          const file = input.files[0];
          const reader = new FileReader();
          reader.onload = (e) => {
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        };
        input.click();
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️ Delete";
      deleteBtn.onclick = () => {
        img.remove();
        toolbar.remove();
        removeResizeHandles();
      };

      toolbar.appendChild(editBtn);
      toolbar.appendChild(deleteBtn);
      document.body.appendChild(toolbar);

      const rect = img.getBoundingClientRect();
      toolbar.style.top = `${window.scrollY + rect.top - 40}px`;
      toolbar.style.left = `${window.scrollX + rect.left + rect.width - 100}px`;
    };

    const handleClick = (e) => {
      if (e.target.tagName === "IMG") {
        showImageToolbar(e.target);
      } else {
        if (toolbar) toolbar.remove();
        removeResizeHandles();
        toolbar = null;
        currentImg = null;
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (toolbar) toolbar.remove();
      removeResizeHandles();
    };
  }, [quill]);

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
                    <div key={action} onClick={() => handleAction(action)} className="dropdown-item">
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
          <button className="action-btn" onClick={() => setShowVersionHistory(!showVersionHistory)}>
            📚 History
          </button>
          <button className="action-btn" onClick={() => setShowNotification((prev) => !prev)}>
            🔔 Notification
          </button>

          {/* Chat Button with notification badge */}
          <button className={`action-btn chat-btn ${showChat ? "chat-active" : ""}`} onClick={toggleChat}>
            💬 Chat
            {chatNotification > 0 && !showChat && <span className="notification-badge">{chatNotification > 9 ? "9+" : chatNotification}</span>}
          </button>

          {/* ✅ Restored full Share Popup (from older file) */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <button className="action-btn" onClick={() => setShowSharePopup(!showSharePopup)}>
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
                      navigator.clipboard.writeText(`${window.location.origin}/documents/${documentId}`);
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

                  <button className="btn-close" onClick={() => setShowSharePopup(false)}>
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
            aria-label="Settings"
            style={{
              backgroundColor: showSettings ? "#ccc" : "transparent",
              borderRadius: "8px",
            }}
          >
            ⚙️ Setting
          </button>
        </div>
      </header>

      <input type="file" accept=".txt,.html" id="fileInput" style={{ display: "none" }} onChange={handleFileUpload} />

      <div className="main-content">
        <div className="container editor-container" ref={wrapperRef} style={{ marginRight: showChat ? "350px" : "0px" }} />

        {/* Version History Panel */}
        {showVersionHistory && (
          <div className="version-history-panel">
            <div className="version-header">
              <h3>📚 Version History</h3>
              <button className="close-btn" onClick={() => setShowVersionHistory(false)}>
                ✖️
              </button>
            </div>
            <div className="version-list">
              {versionHistory.length > 0 ? (
                versionHistory.map((version) => (
                  <div key={version.id} className="version-item">
                    <div className="version-info">
                      <div className="version-time">{version.timestamp.toLocaleString()}</div>
                      <div className="version-user">by {version.user}</div>
                    </div>
                    <button className="restore-btn" onClick={() => restoreVersion(version)}>
                      Restore
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-versions">No versions saved yet</div>
              )}
            </div>
          </div>
        )}

        {/* Chat Sidebar - Slide from right */}
        <div className={`chat-sidebar ${showChat ? "chat-open" : ""}`}>
          {showChat && currentUser && <Chat roomId={documentId} user={currentUser} socket={socket.current} />}
        </div>
      </div>

      {/* Share Modal (More Options) */}
      {showShareModal && (
        <ShareModal
          documentId={documentId}
          documentTitle={document.title || "Untitled Document"}
          onClose={() => setShowShareModal(false)}
          onShareSuccess={() => setShowShareModal(false)}
        />
      )}

      <Settings show={showSettings} onClose={() => setShowSettings(false)} />
      <Notification show={showNotification} onClose={() => setShowNotification(false)} notifications={notificationsData} />
    </>
  );
}
