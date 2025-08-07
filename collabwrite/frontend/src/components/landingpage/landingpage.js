import React from 'react';
import './landingpage.css';
import { Link } from 'react-router-dom';



function Landingpage() {
  return (
    <div>

      <header className="top-nav">
      
        <div className="brand"><Link to='/landingpage'>CollabWrite</Link>
        </div>
        <nav className="nav">
          <Link to='/aboutuspage'>About us</Link>
          <Link to='/featurespage'>Features</Link>
          <Link to='/contactpage'>Contact</Link>
          <Link to='/loginpage'>Log In</Link>
          <Link to='/signuppage'>Sign Up</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-text">
          <h1>Get connected and write together effortlessly with our collaborative text editor</h1>
          <p>Write Together, <strong>Create Better</strong> with CollabWrite</p>
          <ul className="features">
            <li>✔ AI-Powered Suggestions</li>
            <li>✔ Real-Time Collaboration Tools</li>
            <li>✔ Document Templates</li>
            <li>✔ Formatting & Styling Options</li>
          </ul>
          <button className="cta-button">Try CollabWrite</button>
        </div>
        <div className="image">
          <img src="/landing page/Group 33031.png" alt="img" />
        </div>
      </section>


    </div >
  );
}

export default Landingpage;