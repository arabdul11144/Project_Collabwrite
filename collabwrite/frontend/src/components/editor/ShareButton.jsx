import React, { useState } from 'react';
import ShareModal from '../../ShareModal';

const ShareButton = ({ docId }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-blue-500 text-white p-2 rounded">
        Share
      </button>
      {open && <ShareModal docId={docId} onClose={() => setOpen(false)} />}
    </>
  );
};

export default ShareButton;
