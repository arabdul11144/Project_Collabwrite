import React, { useCallback, useState, useRef, useEffect } from "react";
import './styles.css';
import Quill from "quill";

import QuillCursors from "quill-cursors";


import "quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import { saveAs } from "file-saver";
import htmlDocx from "html-docx-js/dist/html-docx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ShareModal from "./ShareModal"; 
import SharePopup from './SharePopup';
import Chat from './chat';
import { io } from "socket.io-client";
import "./QaForum";
import "./Chatbot";
import { useNavigate } from "react-router-dom";

import Delta from "quill-delta";



import Settings from "./Settings";
import Notification from "./Notification";


Quill.register("modules/cursors", QuillCursors);

// ✅ Register a custom HTML blot to display raw HTML inside Quill
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
    { label: "Add Row to Table", action: "add-row" },
  { label: "Add Column to Table", action: "add-column" },
  { label: "Delete Row from Table", action: "delete-row" },
  { label: "Delete Column from Table", action: "delete-column" },
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
  const [quill, setQuill] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareBox, setShowShareBox] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();

  // Chat related states
  const [showChat, setShowChat] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [chatNotification, setChatNotification] = useState(0);
  const [chatReady, setChatReady] = useState(false);

  // NEW FEATURE 1: Auto-save status indicator
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(new Date());

  // NEW FEATURE 2: Document version history
  const [versionHistory, setVersionHistory] = useState([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  //Notification
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationsData] = useState([]);

  //Settings
  const [showSettings, setShowSettings] = useState(false);

  const notifRef = useRef(null);
  const notificationBtnRef = useRef(null);

  const shareBtnRef = useRef(null);
  const dropdownRef = useRef(null);
  const socket = useRef();


  const getUserColor = (userName) => {
  const colors = ["#FF6B6B", "#6BCB77", "#4D96FF", "#FFD93D", "#FF8C00"];
  const index = userName.charCodeAt(0) % colors.length;
  return colors[index];
};


  //notification
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showNotification &&
        dropdownRef.current &&
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


  // Initialize user with a persistent username
  useEffect(() => {
    let userName = localStorage.getItem('textEditor_userName');
    if (!userName) {


      // Generate a unique username
      userName = `User_${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem('textEditor_userName', userName);
    }
    setCurrentUser(userName);
  }, []);



const wrapperRef = useCallback((wrapper) => {
  if (wrapper == null) return;
  wrapper.innerHTML = "";
  const editor = document.createElement("div");
  wrapper.append(editor);

  const q = new Quill(editor, {
  theme: "snow",
  modules: {
    toolbar: TOOLBAR_OPTIONS,
    cursors: true, // 👈 add this line
  },
});


  setQuill(q);

  // ✅ Add this fixed version
  const clipboard = q.getModule("clipboard");

// ✅ Prevent recursion and safely render HTML tables
clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
  if (node.tagName === "TABLE") {
    // Instead of convert(), just return the node as raw HTML
    const tableHTML = node.outerHTML;
    return new Delta().insert({ html: tableHTML });
  }
  return delta;
});

}, []);





  const toggleDropdown = (menu) => {
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      // Reset notification count when opening chat
      setChatNotification(0);
    }
  };

  // Enhanced auto-save with version history
  const saveVersion = (content) => {
    const version = {
      id: Date.now(),
      content: content,
      timestamp: new Date(),
      user: currentUser
    };
    setVersionHistory(prev => [version, ...prev.slice(0, 9)]); // Keep last 10 versions
  };

  // Single Socket.IO connection for both document and chat
  useEffect(() => {
    if (!quill || !currentUser) return;

    // Connect to Socket.IO server
    socket.current = io("http://localhost:5000");

    // Document collaboration setup
    socket.current.emit("join-document", documentId);


    // Tell server that this user has joined (for color assignment)
socket.current.emit("user-join", { user: currentUser });

socket.current.emit("join-document", documentId);
socket.current.emit("user-join", { user: currentUser });


// Handle cursor events
const cursors = quill.getModule("cursors");

// When the user moves their cursor or selects text
quill.on("selection-change", (range) => {
  if (!range) return;
  socket.current.emit("cursor-move", { user: currentUser, range });
});

// When another user's cursor moves
socket.current.on("cursor-update", ({ user, range, color }) => {
  if (user === currentUser) return; // don't show your own cursor
  if (!cursors.cursors[user]) {

 cursors.createCursor(user, user, color);

  }
  cursors.moveCursor(user, range);


  // also set label background color to match cursor color
const cursorElement = document.querySelector(`.ql-cursor[data-id="${user}"] .ql-cursor-name`);
if (cursorElement) {
  cursorElement.style.backgroundColor = color;
  cursorElement.style.setProperty('--cursor-color', color);
}

});



const userColor = getUserColor(currentUser);
socket.current.emit("user-join", { user: currentUser, color: userColor });


    

// Broadcast cursor position when user moves it
quill.on("selection-change", (range) => {
  if (!range) return;
  socket.current.emit("cursor-move", {
    user: currentUser,
    range: range,
  });
});

// Listen for other users' cursor updates
socket.current.on("cursor-update", ({ user, range, color }) => {
  if (user === currentUser) return; // skip own cursor
  cursors.createCursor(user, user, color);
  cursors.moveCursor(user, range);
});


    // Listen once for the initial document load
    socket.current.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
      setAutoSaveStatus('saved');
    });

    // Handle local document changes and send to others
    const handleChange = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.current.emit("send-changes", delta);
      setAutoSaveStatus('saving');
    };
    quill.on("text-change", handleChange);

    // Receive document changes from others
    socket.current.on("receive-changes", (delta) => {
      const currentSelection = quill.getSelection();
      quill.updateContents(delta);
      if (currentSelection) {
        quill.setSelection(currentSelection);
      }
    });

    // Chat notification handler
    socket.current.on("new-message", (message) => {
      if (!showChat && message.user !== currentUser) {
        setChatNotification(prev => prev + 1);
      }
    });

    // Enhanced save with version tracking
    const interval = setInterval(() => {
      const content = quill.getContents();
      socket.current.emit("save-document", {
        docId: documentId,
        data: content
      });
      
      // Save version every minute
      if (Date.now() - lastSaved.getTime() > 60000) {
        saveVersion(content);
        setLastSaved(new Date());
      }
      
      setAutoSaveStatus('saved');
    }, 2000);

    // Save error handler
    socket.current.on("save-error", () => {
      setAutoSaveStatus('error');
    });

    // Cleanup
    return () => {
      clearInterval(interval);
      socket.current.off("receive-changes");
      socket.current.off("new-message");
      socket.current.off("save-error");
      quill.off("text-change", handleChange);
      socket.current.disconnect();
    };
  }, [quill, documentId, currentUser, showChat, lastSaved]);

  const restoreVersion = (version) => {
    if (window.confirm(`Restore version from ${version.timestamp.toLocaleString()}?`)) {
      quill.setContents(version.content);
      setShowVersionHistory(false);
    }
  };
  // ✅ Floating Edit/Delete toolbar for images
useEffect(() => {
  if (!quill) return;

  let toolbar = null;
  let currentImg = null;
  let resizeHandles = [];

  // Helper: Remove resize handles
  const removeResizeHandles = () => {
    resizeHandles.forEach((h) => h.remove());
    resizeHandles = [];
  };

  // Helper: Create resize handles
  const createResizeHandles = (img) => {
    const positions = ["tl", "tr", "bl", "br"];
    positions.forEach((pos) => {
      const handle = document.createElement("div");
      handle.classList.add("resize-handle", pos);
      document.body.appendChild(handle);

      // Position the handles
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

      // Drag-to-resize functionality
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
    // Remove existing toolbar and handles
    if (toolbar) toolbar.remove();
    removeResizeHandles();

    currentImg = img;
    createResizeHandles(img);

    // Create toolbar
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

    // Position toolbar
    const rect = img.getBoundingClientRect();
    toolbar.style.top = `${window.scrollY + rect.top - 40}px`;
    toolbar.style.left = `${window.scrollX + rect.left + rect.width - 100}px`;
  };

  const handleClick = (e) => {
    if (e.target.tagName === "IMG") {
      showImageToolbar(e.target);
    } else {
      // Clicked outside → remove toolbar and handles
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

      case "insert-image":
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

      case "insert-link":
  {
    const range = quill.getSelection(true);
    if (!range) {
      alert("Please place your cursor where you want to insert the link.");
      break;
    }

    const url = prompt("Enter the URL (e.g., https://example.com):");
    if (!url) break;

    const text = prompt("Enter display text for the link:") || url;

    // Insert link text and make it clickable
    quill.insertText(range.index, text, "link", url);
    quill.setSelection(range.index + text.length, 0);
  }
  break;



        case "insert-table":
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


case "add-row":
  {
    const table = quill.root.querySelector("table:last-of-type");
    if (!table) {
      alert("No table found. Insert a table first!");
      break;
    }

    // Find the number of columns from the first row
    const cols = table.rows[0]?.cells.length || 2;

    // Create a new row
    const newRow = table.insertRow(-1);
    for (let i = 0; i < cols; i++) {
      const cell = newRow.insertCell(i);
      cell.style.border = "2px solid #1c1c1cff";
      cell.style.padding = "8px";
      cell.innerText = " ";
    }
  }
  break;

case "add-column":
  {
    const table = quill.root.querySelector("table:last-of-type");
    if (!table) {
      alert("No table found. Insert a table first!");
      break;
    }

    // Add one new cell to each row
    for (let row of table.rows) {
      const newCell = row.insertCell(-1);
      newCell.style.border = "2px solid #1c1b1bff";
      newCell.style.padding = "8px";
      newCell.innerText = " ";
    }
  }
  break;

case "delete-row":
  {
    const table = quill.root.querySelector("table:last-of-type");
    if (!table) {
      alert("No table found. Insert a table first!");
      break;
    }

    // Delete the last row if it exists
    if (table.rows.length > 1) {
      table.deleteRow(-1);
    } else {
      alert("Cannot delete the last remaining row!");
    }
  }
  break;

case "delete-column":
  {
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

    // Delete the last cell of each row
    for (let row of table.rows) {
      row.deleteCell(-1);
    }
  }
  break;

case "delete-table":
  {
    const table = quill.root.querySelector("table:last-of-type");
    if (!table) {
      alert("No table found to delete!");
      break;
    }
    table.remove();
  }
  break;





      case "Horizontal-line":
  {
    const range = quill.getSelection(true);
    quill.clipboard.dangerouslyPasteHTML(
      range?.index || quill.getLength(),
      "<hr style='border: 2px solid #000000ff; margin: 12px 0;'/>"
    );
  }
  break;


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

      case "find-replace":
        const find = prompt("Find:");
        if (!find) return;
        const replace = prompt("Replace with:");
        quill.setText(quill.getText().replaceAll(find, replace));
        break;

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

  const handleFileUpload = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      quill.root.innerHTML = reader.result;
    };
    reader.readAsText(e.target.files[0]);
  };
  

  return (
    <>
      <header className="topbar">
        <div className="dropdown-menu">
          <img
            src="/logo.png"
            alt="Logo"
            className="logo-img"
          />
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

        {/* NEW FEATURE 1: Auto-save status indicator */}
        <div className="auto-save-status">
          <span className={`status-indicator ${autoSaveStatus}`}>
            {autoSaveStatus === 'saving' && '💾 Saving...'}
            {autoSaveStatus === 'saved' && '✅ Saved'}
            {autoSaveStatus === 'error' && '⚠️ Error'}
          </span>
        </div>
        
        <div className="topbar-actions">
          <button className="action-btn"
           onClick={() => navigate("/bot")}
          >
            🤖 AI
          </button>



          <button 
            className="action-btn" 
            onClick={() => navigate("/qa")}
          >
            ❓ QA
          </button>

          {/* NEW FEATURE 2: Version History Button */}
          <button 
            className="action-btn" 
            onClick={() => setShowVersionHistory(!showVersionHistory)}
          >
            📚 History
          </button>

          <button className="action-btn"
          onClick={() => setShowNotification((prev) => !prev)}
          aria-label="Notifications"> 🔔 Notification
          </button>
          {showNotification && (
        <Notification
        show={showNotification}
        notifRef={notifRef}
        notifications={notifications}
        onDelete={handleDelete}
        />
        )}

          
          {/* Chat Button with notification badge */}
          <button 
            className={`action-btn chat-btn ${showChat ? 'chat-active' : ''}`}
            onClick={toggleChat}
          >
            💬 Chat
            {chatNotification > 0 && !showChat && (
              <span className="notification-badge">
                {chatNotification > 9 ? '9+' : chatNotification}
              </span>
            )}
          </button>





          
          <div ref={shareBtnRef} style={{ position: "relative", display: "inline-block" }}>
            <button className="action-share" onClick={() => setShowShareBox(!showShareBox)}>
              📤 Share
            </button>

            {showShareBox && (
              <div className="share-box">
                <h4 className="share-title">
                  📤 Share Document
                </h4>

                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/documents/${documentId}`}
                  onClick={(e) => e.target.select()}
                  className="share-input"
                />

                <div className="share-actions">
                  <button
                    className="btn-close"
                    onClick={() => setShowShareBox(false)}
                  >
                    Close
                  </button>
                  <button
                    className={`btn-copy ${copySuccess ? 'copied' : ''}`}
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/documents/${documentId}`);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                  >
                    {copySuccess ? "✅ Copied!" : "📋 Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>





          

          <button className="action-btn">👥 Participate</button>
          <button className="action-btn settings-btn" onClick={() => setShowSettings(!showSettings)}
          aria-label="Settings"
          style={{
              backgroundColor: showSettings ? "#ccc" : "transparent",
              borderRadius: "8px",
            }}>⚙️ Setting
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

      {/* Main content area */}
      <div className="main-content">
        
        {/* Text Editor Container */}
        <div 
          className="container editor-container" 
          ref={wrapperRef}
          style={{ 
            marginRight: showChat ? '350px' : '0px',
          }}
        />

        {/* NEW FEATURE 2: Version History Panel */}
        {showVersionHistory && (
          <div className="version-history-panel">
            <div className="version-header">
              <h3>📚 Version History</h3>
              <button 
                className="close-btn"
                onClick={() => setShowVersionHistory(false)}
              >
                ✖️
              </button>
            </div>
            <div className="version-list">
              {versionHistory.length > 0 ? (
                versionHistory.map((version) => (
                  <div key={version.id} className="version-item">
                    <div className="version-info">
                      <div className="version-time">
                        {version.timestamp.toLocaleString()}
                      </div>
                      <div className="version-user">by {version.user}</div>
                    </div>
                    <button 
                      className="restore-btn"
                      onClick={() => restoreVersion(version)}
                    >
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
        <div className={`chat-sidebar ${showChat ? 'chat-open' : ''}`}>
          {showChat && currentUser && (
            <Chat 
              roomId={documentId} // Use document ID as chat room
              user={currentUser}
              socket={socket.current} // Pass the same socket connection
            />
          )}
        </div>
      </div>

      {showShareModal && (
        <ShareModal
          docId={documentId}
          onClose={() => setShowShareModal(false)}
        />
      )}

       {/* Settings popup */}
      <Settings show={showSettings} onClose={() => setShowSettings(false)} />

      {/* Notification popup */}
      <Notification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        notifications={notificationsData}
      />


    </>
  );
}