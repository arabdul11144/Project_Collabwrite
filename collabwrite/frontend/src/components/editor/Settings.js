import React, { useEffect, useRef, useState } from "react";
import "./Settings.css";
import ProfileSettings from "./ProfileSettings";

export default function Settings({ show, onClose }) {
  const settingsRef = useRef(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);



  const openProfileSettings = () => {
    setShowProfileSettings(true);
  };

  const closeProfileSettings = () => {
    setShowProfileSettings(false);
  };

  const handleProfileSave = (data) => {
    console.log("Profile saved:", data);
    // Here you can add logic to send data to backend
  };

  if (!show) return null;

  return (
    <>
      <div
        ref={settingsRef}
        className="settings-container"
      >
        <strong className="settings-title">⚙️ Settings</strong>

        <div className="setting-item" onClick={openProfileSettings} style={{ cursor: "pointer" }}>
          <img src="/account.png" className="setting-icon" alt="" />
          <span>Profile Settings</span>
        </div>

        <div className="setting-item">
          <img src="/changepassword.png" className="setting-icon" alt="" />
          <span>Change Password</span>
        </div>

        <div className="setting-item">
          <img src="/notification.png" className="setting-icon" alt="" />
          <span>Notifications</span>
          <label style={{ marginLeft: "auto" }}>
            <input type="checkbox" /> Enable
          </label>
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label>
            <input
              type="checkbox"
              onChange={() => document.body.classList.toggle("dark-mode")}
            />{" "}
            Dark Mode
          </label>
        </div>

        <div className="setting-item" onClick={() => alert("Logging out...")} style={{ cursor: "pointer" }}>
          <img src="/logout.png" className="setting-icon" alt="" />
          <span style={{ color: "#f87171", fontWeight: "bold" }}>Logout</span>
        </div>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <ProfileSettings
        show={showProfileSettings}
        onClose={closeProfileSettings}
        onSave={handleProfileSave}
      />
    </>
  );
}
