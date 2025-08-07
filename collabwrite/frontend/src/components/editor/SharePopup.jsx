import React, { useState, useRef, useEffect } from 'react';

function SharePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);

  // Toggle popup on button click
  const togglePopup = (e) => {
    e.stopPropagation(); // Important: prevent bubbling
    setIsOpen(prev => !prev);
  };

  // Close popup if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={togglePopup}>
        Share
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          style={{
            position: 'absolute',
            top: '40px',
            left: 0,
            background: '#fff',
            border: '1px solid #ccc',
            padding: '10px',
            zIndex: 999,
            width: '200px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p>This is the pop-up content.</p>
        </div>
      )}
    </div>
  );
}

export default SharePopup;
