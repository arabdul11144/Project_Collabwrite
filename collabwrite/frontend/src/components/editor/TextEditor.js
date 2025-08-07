import React, { useCallback, useState, useRef, useEffect } from "react";
import './styles.css';
import Quill from "quill";
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
    { label: "Horizontal Line", action: "insert-line" },
  ],
  Edit: [
    { label: "Undo", action: "undo" },
    { label: "Redo", action: "redo" },
    { label: "Cut", action: "cut" },
    { label: "Copy", action: "copy" },
    { label: "Paste", action: "paste" },
    { label: "Select All", action: "select-all" },
    { label: "Find & Replace", action: "find-replace" },
  ],
  View: [
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
  
  // Chat related states
  const [showChat, setShowChat] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [chatNotification, setChatNotification] = useState(0);
  
  const shareBtnRef = useRef(null);
  const dropdownRef = useRef(null);
  const socket = useRef();

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
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    setQuill(q);
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

  // Single Socket.IO connection for both document and chat
  useEffect(() => {
    if (!quill || !currentUser) return;

    // Connect to Socket.IO server
    socket.current = io("http://localhost:4000");

    // Document collaboration setup
    socket.current.emit("join-document", documentId);

    // Listen once for the initial document load
    socket.current.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    // Handle local document changes and send to others
    const handleChange = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.current.emit("send-changes", delta);
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

    // Save document every 2 seconds
    const interval = setInterval(() => {
      socket.current.emit("save-document", {
        docId: documentId,
        data: quill.getContents()
      });
    }, 2000);

    // Cleanup
    return () => {
      clearInterval(interval);
      socket.current.off("receive-changes");
      socket.current.off("new-message");
      quill.off("text-change", handleChange);
      socket.current.disconnect();
    };
  }, [quill, documentId, currentUser, showChat]);

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
        const url = prompt("Enter URL:");
        if (url) {
          const range = quill.getSelection();
          if (range) quill.format("link", url);
        }
        break;

      case "insert-table":
        quill.clipboard.dangerouslyPasteHTML(
          quill.getSelection(true)?.index || 0,
          `<table border="1" style="width:100%;"><tr><th>Header</th><th>Header</th></tr><tr><td>Cell</td><td>Cell</td></tr></table><br/>`
        );
        break;

      case "insert-line":
        quill.clipboard.dangerouslyPasteHTML(quill.getSelection(true)?.index || 0, "<hr />");
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
            style={{ height: "40px" }}
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
        
        <div className="topbar-actions">
          <button className="action-btn">AI</button>
          <button className="action-btn">QA</button>
          <button className="action-btn">Notification</button>
          
          {/* Chat Button with notification badge */}
          <button 
            className={`action-btn ${showChat ? 'chat-active' : ''}`}
            onClick={toggleChat}
            style={{
              position: 'relative',
              backgroundColor: showChat ? '#3b82f6' : '',
              color: showChat ? 'white' : '',
              transition: 'all 0.3s ease'
            }}
          >
            Chat
            {chatNotification > 0 && !showChat && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {chatNotification > 9 ? '9+' : chatNotification}
              </span>
            )}
          </button>
          
          <div ref={shareBtnRef} style={{ position: "relative", display: "inline-block" }}>
            <button className="action-share" onClick={() => setShowShareBox(!showShareBox)}>
              Share
            </button>

            {showShareBox && (
              <div className="share-box" style={{ 
                position: 'absolute',
                top: '100%',
                right: '0',
                maxWidth: "350px", 
                background: "#06c9ef", 
                padding: "20px", 
                borderRadius: "10px", 
                boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                zIndex: 1000
              }}>
                <h4 style={{ marginBottom: "15px", fontSize: "16px", marginTop: "5px" }}>
                  📤 Share Document
                </h4>

                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/documents/${documentId}`}
                  onClick={(e) => e.target.select()}
                  style={{ 
                    width: "100%", 
                    padding: "6px", 
                    marginBottom: "10px", 
                    borderRadius: "4px", 
                    border: "1px solid #ccc" 
                  }}
                />

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button
                    style={{
                      background: "#f44336",
                      color: "white",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowShareBox(false)}
                  >
                    Close
                  </button>
                  <button
                    style={{
                      background: copySuccess ? "hsla(112, 86%, 23%, 1.00)" : "#51e800ff",
                      color: "white",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/documents/${documentId}`);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                  >
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="action-btn">Participate</button>
          <button className="action-btn">Setting</button>
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
      <div style={{ 
        display: 'flex', 
        height: 'calc(100vh - 70px)', // Adjust based on your header height
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Text Editor Container */}
        <div 
          className="container" 
          ref={wrapperRef}
          style={{ 
            flex: 1,
            transition: 'margin-right 0.3s ease-in-out',
            marginRight: showChat ? '350px' : '0px', // Make space for chat
            minHeight: '100%'
          }}
        />

        {/* Chat Sidebar - Slide from right */}
        <div style={{
          position: 'fixed',
          right: showChat ? '0' : '-350px',
          top: '70px', // Adjust based on your header height
          height: 'calc(100vh - 70px)',
          width: '350px',
          zIndex: 1000,
          boxShadow: showChat ? '-2px 0 10px rgba(0,0,0,0.1)' : 'none',
          transform: 'translateZ(0)', // Hardware acceleration
          transition: 'right 0.3s ease-in-out',
          backgroundColor: '#ffffff'
        }}>
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

      {/* Add custom styles for chat integration */}
      <style jsx>{`
        .chat-active {
          background-color: #3b82f6 !important;
          color: white !important;
        }
        
        .topbar {
          z-index: 1001; /* Ensure topbar stays above chat */
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .container {
            margin-right: ${showChat ? '100vw' : '0'} !important;
          }
          
          .chat-sidebar {
            width: 100vw !important;
            right: ${showChat ? '0' : '-100vw'} !important;
          }
        }
      `}</style>
    </>
  );
}