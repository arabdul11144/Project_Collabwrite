import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
import ProfileSettings from "./ProfileSettings";

export default function Settings({ show, onClose }) {
  const settingsRef = useRef(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const navigate = useNavigate();

  const openProfileSettings = () => {
    setShowProfileSettings(true);
  };

  const closeProfileSettings = () => {
    setShowProfileSettings(false);
  };

  const handleProfileSave = (data) => {
    console.log("Profile saved:", data);
    // Add logic to send profile data to backend here
  };

  const handleLogout = () => {
    // ✅ Clear session or tokens
    localStorage.removeItem("authToken");
    sessionStorage.clear();

    // ✅ Optional message before redirect
    

    // ✅ Redirect to login page
    navigate("/loginpage");

  };

  // If settings modal is not open, return nothing
  if (!show) return null;

  return (
    <>
      <div ref={settingsRef} className="settings-container">
        <strong className="settings-title">⚙️ Settings</strong>

        <div
          className="setting-item"
          onClick={openProfileSettings}
          style={{ cursor: "pointer" }}
        >
          <img src="/account.png" className="setting-icon" alt="account" />
          <span>Profile Settings</span>
        </div>

        <div className="setting-item">
          <img src="/changepassword.png" className="setting-icon" alt="password" />
          <span>Change Password</span>
        </div>

        <div className="setting-item">
           <div style={{ marginBottom: "10px" }}>
          <label> 
            <input
        
              type="checkbox"
              onChange={() => document.body.classList.toggle("dark-mode")}
            />{" "}
           Dark Mode
          </label>
        </div>
        </div>

       

        {/* ✅ Logout button */}
        <div
          className="setting-item"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        >
          <img src="/logout.png" className="setting-icon" alt="logout" />
          <span style={{ color: "#f87171", fontWeight: "bold" }}>Logout</span>
        </div>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Profile Settings modal */}
      <ProfileSettings
        show={showProfileSettings}
        onClose={closeProfileSettings}
        onSave={handleProfileSave}
      />
    </>
  );
}
