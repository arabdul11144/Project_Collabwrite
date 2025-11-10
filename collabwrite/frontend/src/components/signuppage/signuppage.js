import { GoogleLogin } from "@react-oauth/google"; // Add this import
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import './signuppage.css';

function Registerpage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      navigate('/loginpage');
    } catch (err) {
      if (err.response?.data?.message) {
        setRegisterError(err.response.data.message);
      } else {
        setRegisterError("Server error. Please try again.");
      }
    }
  };

  const handleGoogleRegister = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;

      const res = await axios.post("http://localhost:5000/users/google-login", { token });

      if (res.data.user) {
        navigate('/homepage');
      }
    } catch (err) {
      console.error("Google registration failed:", err);
      setRegisterError("Google registration failed. Try again.");
    }
  };

  return (
    <div className="register-background">
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <div className="circle circle3"></div>

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

            <input type="text" name="name" value={user.name} onChange={handleInputChange} placeholder="Name" required />


            <input type="email" name="email" value={user.email} onChange={handleInputChange} placeholder="Email" required />

            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={user.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
              />
              <span className="eye-icon" onClick={() => setShowPassword(prev => !prev)}>{showPassword ? "🔓" : "🔒"}</span>
            </div>

            <div className="password-box">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
              />
              <span className="eye-icon" onClick={() => setShowConfirmPassword(prev => !prev)}>{showConfirmPassword ? "🔓" : "🔒"}</span>
            </div>

            <button type="submit">Sign up</button>

            <div className="divider"><span>or</span></div>

            <div className="social-register">
              <GoogleLogin
                onSuccess={handleGoogleRegister}
                onError={() => setRegisterError("Google registration failed")}
              />

            </div>

            <p className="signup-text">Already have an account? <Link to='/loginpage'>Log in</Link></p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Registerpage;
