import React, { useState } from "react";

export default function ShareModal({ docId, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareLink = `${window.location.origin}/document/${docId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Share Document</h2>
        <input
          type="text"
          value={shareLink}
          readOnly
          style={inputStyle}
        />
        <br />
        <button onClick={handleCopy} style={copyButtonStyle}>
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button onClick={onClose} style={closeButtonStyle}>
          Close
        </button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  textAlign: "center",
  width: "300px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  fontSize: "14px",
};

const copyButtonStyle = {
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  marginRight: "10px",
  borderRadius: "5px",
  cursor: "pointer",
};

const closeButtonStyle = {
  backgroundColor: "#dc3545",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: "5px",
  cursor: "pointer",
};
