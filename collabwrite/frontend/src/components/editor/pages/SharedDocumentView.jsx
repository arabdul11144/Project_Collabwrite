// src/pages/SharedDocumentView.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './SharedDocumentView.css';

const SharedDocumentView = () => {
  const { shareId } = useParams();
  const [document, setDocument] = useState(null);
  const [permission, setPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/documents/shared/${shareId}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load document');
          return;
        }

        setDocument(data.document);
        setPermission(data.permission);

      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [shareId]);

  if (loading) return <div className="loading">⏳ Loading document...</div>;
  if (error) return <div className="error">❌ {error}</div>;
  if (!document) return <div className="error">❌ Document not found</div>;

  return (
    <div className="shared-document-view">
      <div className="document-header">
        <h1>📄 {document.title}</h1>
        <div className="document-info">
          <p className="permission-badge">
            Permission: <strong>{permission === 'edit' ? '✏️ Can Edit' : '👁️ View Only'}</strong>
          </p>
          <p className="shared-by">📤 Shared by: {document.sharedBy}</p>
        </div>
      </div>

      <div className={`document-content ${permission === 'view' ? 'read-only' : ''}`}>
        {permission === 'edit' ? (
          <textarea 
            defaultValue={document.content}
            className="editable-content"
            placeholder="Edit document here..."
          />
        ) : (
          <div className="content-display">{document.content}</div>
        )}
      </div>
    </div>
  );
};

export default SharedDocumentView;