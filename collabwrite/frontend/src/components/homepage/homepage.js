import React from 'react'
import './homepage.css';
import { useNavigate } from 'react-router-dom';


function Homepage() {

  const navigate = useNavigate();

  const handleTemplateClick = () => {
    navigate('/editor');
  };

  const templates = [
    { title: "Blank document", image: "./Blank document.png" },
    { title: "Project Proposal", image: "./Project Proposal.png" },
    { title: "Resume", image: "./Resume.png" },
    { title: "Cover letter", image: "./Cover letter.png" },
    { title: "Student report", image: "./Student report.png" },
  ];

  const recents = [
    { title: "CV", image: "./CV.png" },
    { title: "JAAAI", image: "./Jaaai.png" },
    { title: "Assignment", image: "./Assignment.png" },
    { title: "Request Letter", image: "./Request Letter.png" },
    { title: "Browse New", image: "./Browse New.png" },
  ];

  return (

    <div>
      <div className="header">
        <img className="logo" src="/logo.png" alt="Logo" />
        <input type="text" className="search-bar" placeholder="Search" />
      </div>

      <div className="template-container">

        <div className="section">
          <h2>Create New Document</h2>
          <div className="card-row">
            {templates.map((doc, index) => (
              <div className="card" key={index} onClick={handleTemplateClick}>
                <img src={doc.image} alt={doc.title} />
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
                <img src={doc.image} alt={doc.title} />
                <p>{doc.title}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );

}

export default Homepage
