import React, { useState, useRef, useEffect } from "react";
import "./Notification.css";

export default function Notification({ show, onClose }) {
  const notifRef = useRef(null);

  // Enhanced notification state with new structure
  const [notifications, setNotifications] = useState({
    new: [
      { 
        id: 1, 
        text: "Malik commented on your question", 
        type: "info", 
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        read: false 
      },
      { 
        id: 2, 
        text: "Sara replied to your answer", 
        type: "success", 
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        read: false 
      },
      { 
        id: 3, 
        text: "John liked your comment", 
        type: "success", 
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        read: false 
      },
    ],
    old: [
      { 
        id: 4, 
        text: "Kelin commented on your question", 
        type: "info", 
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        read: true 
      },
      { 
        id: 5, 
        text: "Anna replied to your answer", 
        type: "info", 
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        read: true 
      },
    ],
  });

  if (!show) return null;

  const handleDelete = (section, id) => {
    setNotifications((prev) => ({
      ...prev,
      [section]: prev[section].filter((n) => n.id !== id),
    }));
  };

  const handleMarkAsRead = (section, id) => {
    const notification = notifications[section].find(n => n.id === id);
    if (notification && section === "new") {
      setNotifications(prev => ({
        ...prev,
        new: prev.new.filter(n => n.id !== id),
        old: [{ ...notification, read: true }, ...prev.old]
      }));
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => ({
      new: [],
      old: [...prev.new.map(n => ({ ...n, read: true })), ...prev.old]
    }));
  };

  const handleClearAll = () => {
    setNotifications({ new: [], old: [] });
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(timestamp)) / 1000);
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      case 'info':
      default: return 'ℹ';
    }
  };

  const renderActions = (section, id) => (
    <div className="notif-actions">
      <button 
        onClick={() => handleMarkAsRead(section, id)} 
        title="Mark as read" 
        className="notif-action-btn"
      >
        ✓
      </button>
      <button 
        onClick={() => handleDelete(section, id)} 
        title="Delete" 
        className="notif-action-btn"
      >
        ✕
      </button>
    </div>
  );

  const totalNotifications = notifications.new.length + notifications.old.length;

  return (
    <div ref={notifRef} className="notification-popup">
      <div className="notif-header">
        <strong className="notif-title">
          Notifications 
        </strong>
        <button className="notif-close" onClick={onClose}>✖️</button>
      </div>

      <div className="notif-content">
        <div className="notif-section">
          <div className="notif-section-title">New</div>
          <div className="notif-list">
            {notifications.new.length > 0 ? (
              notifications.new.map((n) => (
                <div key={n.id} className={`notif-item ${n.type} unread`}>
                  <span className={`notif-icon ${n.type}`}>
                    {getNotificationIcon(n.type)}
                  </span>
                  <div className="notif-content-text">
                    <div className="notif-title-text">{n.text}</div>
                    <div className="notif-time">{formatTimestamp(n.timestamp)}</div>
                  </div>
                  {renderActions("new", n.id)}
                </div>
              ))
            ) : (
              <div className="notif-empty">No new notifications</div>
            )}
          </div>
        </div>

        <div className="notif-section">
          <div className="notif-section-title">Earlier</div>
          <div className="notif-list">
            {notifications.old.length > 0 ? (
              notifications.old.map((n) => (
                <div key={n.id} className={`notif-item ${n.type} read`}>
                  <span className={`notif-icon ${n.type}`}>
                    {getNotificationIcon(n.type)}
                  </span>
                  <div className="notif-content-text">
                    <div className="notif-title-text">{n.text}</div>
                    <div className="notif-time">{formatTimestamp(n.timestamp)}</div>
                  </div>
                  {renderActions("old", n.id)}
                </div>
              ))
            ) : (
              <div className="notif-empty">No earlier notifications</div>
            )}
          </div>
        </div>
      </div>

      <div className="notif-footer">
        <button className="notif-footer-btn" onClick={handleMarkAllRead}>
          Mark all as read
        </button>
        <button className="notif-footer-btn" onClick={handleClearAll}>
          Clear all
        </button>
      </div>
    </div>
  );
}
