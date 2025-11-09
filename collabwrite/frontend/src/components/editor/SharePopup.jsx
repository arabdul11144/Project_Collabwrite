import React from 'react';
import ShareModal from './ShareModal';

const SharePopup = ({ 
  documentId, 
  documentTitle, 
  onClose, 
  onShareSuccess 
}) => {
  return (
    <ShareModal
      documentId={documentId}
      documentTitle={documentTitle}
      onClose={onClose}
      onShareSuccess={onShareSuccess}
    />
  );
};

export default SharePopup;