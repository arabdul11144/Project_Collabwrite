import React, { useState } from 'react';
import './signuppage.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Registerpage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  const [registerError, setRegisterError] = useState("");


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };



  const handleSubmit = async (e) => {
  e.preventDefault();
  setRegisterError("");

  if (user.password !== confirmPassword) {
    setRegisterError("Passwords do not match");
    return;
  }

  try {
    await axios.post("http://localhost:5000/users", {
      name: user.name,
      email: user.email,
      password: user.password,
    });

    console.log("Register successful");
    navigate('/loginpage');
  } catch (err) {
    console.error("Error during Register:", err);

    // Check if backend sent a custom message
    if (err.response && err.response.data && err.response.data.message) {
      setRegisterError(err.response.data.message);
    } else {
      setRegisterError("Server error. Please try again.");
    }
  }
};


 

  return (
    <div className="register-background">
      <div class="circle circle1"></div>
      <div class="circle circle2"></div>
      <div class="circle circle3"></div>


      <div className="register-card">
        <div className="register-left">
          <div className="content-left">
            <img src="\logo.png" alt="logo" className="logoimg" />
            <h1>Write, edit, and create together</h1>
            <p>where ideas flow and collaboration thrives. Join the space where teamwork brings words to life</p>
            <img src="\signup\regamico.png" alt="logamico" />
            <h2>Create an account to join our space</h2>
          </div>
        </div>

        <div className="register-right">
          <form className="register-box" onSubmit={handleSubmit}>
            <div className="avatar">👤</div>
            <h2>Create Account</h2>

            {registerError && <p className="error-message">{registerError}</p>}

            <label htmlFor="name">Name :</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleInputChange}
              id="name"
              placeholder=" Name"
              required
            />

            <label>Email :</label>
            <div className="password-box">
              <input type="email" name="email" value={user.email} onChange={handleInputChange} id="email" placeholder="Username" required />
            </div>

            <label htmlFor="password">Password :</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleInputChange}
              id="password"
              placeholder=" Password"
              required
            />

            <label htmlFor="confirm-password">Confirm Password :</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              id="confirm-password"
              placeholder=" Confirm Password"
              required
            />


            <button type="submit">Sign up</button>

            <div className="divider"><span>or</span></div>

            <div className="social-register">
              <button className="google">G</button>
              <button className="facebook">f</button>
              <button className="linkedin">in</button>
            </div>

            <p className="signup-text">Already have an account? <Link to='/loginpage'>Log in</Link></p>
          </form>
        </div>
      </div>
    </div>
  );


}

export default Registerpage;

