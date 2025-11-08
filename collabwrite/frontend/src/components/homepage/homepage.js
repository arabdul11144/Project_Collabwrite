import React, { useState, useEffect } from 'react';
import './homepage.css';
import { useNavigate } from 'react-router-dom';

function Homepage() {
  const navigate = useNavigate();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const handleTemplateClick = () => {
    navigate('/editor');
  };

  const templates = [
    { title: "Blank document", image: "/homepage/Blank document.png" },
    { title: "Project Proposal", image: "/homepage/Project Proposal.png" },
    { title: "Resume", image: "/homepage/Resume.png" },
    { title: "Cover letter", image: "/homepage/Cover letter.png" },
    { title: "Student report", image: "/homepage/Student report.png" },
  ];

  const recents = [
    { title: "CV", image: "/homepage/CV.png" },
    { title: "JAAAI", image: "/homepage/Jaaai.png" },
    { title: "Assignment", image: "/homepage/Assignment.png" },
    { title: "Request Letter", image: "/homepage/Request Letter.png" },
    { title: "Browse New", image: "/homepage/Browse New.png" },
  ];

  // Total images to load (templates + recents + logo)
  const totalImages = templates.length + recents.length + 1;

  // Handle when an image loads successfully
  const handleImageLoad = () => {
    setLoadedCount(prev => {
      const newCount = prev + 1;
      // When all images are loaded, show the content
      if (newCount >= totalImages) {
        setImagesLoaded(true);
      }
      return newCount;
    });
  };

  // Handle image loading errors
  const handleImageError = (imagePath) => {
    console.warn(`Failed to load image: ${imagePath}`);
    // Still count as "loaded" to prevent hanging
    handleImageLoad();
  };

  // Preload all images when component mounts
  useEffect(() => {
    const allImagePaths = [
      '/logo.png',
      ...templates.map(t => t.image),
      ...recents.map(r => r.image)
    ];

    // Preload images
    allImagePaths.forEach(imagePath => {
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = () => handleImageError(imagePath);
      img.src = imagePath;
    });

    // Fallback: Show content after 3 seconds even if some images fail
    const fallbackTimer = setTimeout(() => {
      if (!imagesLoaded) {
        console.warn('Some images took too long to load, showing content anyway');
        setImagesLoaded(true);
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <div>
      {/* Loading spinner - only show while images are loading */}
      {!imagesLoaded && (
        <div className="page-loader">
          <div className="spinner"></div>
          <p style={{ marginTop: '20px', color: '#666' }}>
            Loading... ({loadedCount}/{totalImages})
          </p>
        </div>
      )}

      {/* Main content - show when images are ready */}
      <div style={{ 
        opacity: imagesLoaded ? 1 : 0, 
        transition: 'opacity 0.5s ease-in-out',
        visibility: imagesLoaded ? 'visible' : 'hidden'
      }}>
        <div className="header">
          <img 
            className="logo" 
            src="/logo.png" 
            alt="Logo"
            onLoad={handleImageLoad}
            onError={() => handleImageError('/logo.png')}
          />
          <input type="text" className="search-bar" placeholder="Search" />
        </div>

        <div className="template-container">
          <div className="section">
            <h2>Create New Document</h2>
            <div className="card-row">
              {templates.map((doc, index) => (
                <div className="card" key={index} onClick={handleTemplateClick}>
                  <img 
                    src={doc.image} 
                    alt={doc.title}
                    onLoad={handleImageLoad}
                    onError={() => handleImageError(doc.image)}
                  />
                  <p>{doc.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>Recent Documents</h2>
            <div className="card-row">
              {recents.map((doc, index) => (
                <div className="card" key={index} onClick={handleTemplateClick}>
                  <img 
                    src={doc.image} 
                    alt={doc.title}
                    onLoad={handleImageLoad}
                    onError={() => handleImageError(doc.image)}
                  />
                  <p>{doc.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
