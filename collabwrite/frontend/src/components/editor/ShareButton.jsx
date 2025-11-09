import React, { useState } from 'react';
import ShareModal from './ShareModal';

const ShareButton = ({ documentId, documentTitle }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button 
        className="action-btn"
        onClick={() => setShowModal(true)}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '14px'
        }}
      >
        📤 Share
      </button>

      {showModal && (
        <ShareModal
          documentId={documentId}
          documentTitle={documentTitle}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ShareButton;