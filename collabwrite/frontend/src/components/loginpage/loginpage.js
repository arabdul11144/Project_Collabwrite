import React, { useState } from 'react';
import './loginpage.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Loginpage() {

  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const [loginError, setLoginError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoginError(""); // Reset error message on new submission
  //   try {
  //     const response = await sendRequest();
  //     console.log("Response:", response);
  //     if (response.status === "ok") {
  //       console.log("Login successful");
  //       navigate('/homepage');
  //     } else {
  //       console.error("Login failed");
  //       setLoginError("Invalid email or password");
  //     }
  //   } catch (err) {
  //     console.error("Error during login:", err);
  //     setLoginError("Server error. Please try again.");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await sendRequest();
      console.log("Response:", response);

      // Check backend message instead of 'status'
      if (response.message === "Login successful!") {
        console.log("Login successful");
        navigate('/homepage');
      } else {
        setLoginError(response.message || "Invalid email or password");
      }

    } catch (err) {
      console.error("Error during login:", err);
      setLoginError("Server error. Please try again.");
    }
  };





  const sendRequest = async () => {
    return await axios.post("http://localhost:5000/users/login", {
      email: user.email,
      password: user.password,
    }).then((res) => res.data);
  }


  return (


    <div className="login-background">
      <div className="circle circle1"></div>
      <div className="circle circle2"></div>
      <div className="circle circle3"></div>


      <div className="login-card">
        <div className="login-left">
          <div className="content-left">
            <img src="\logo.png" alt="logo" className="logoimg" />
            <h1>Collaborate with us<br />Explore with us</h1>
            <img src="\loginpage\logamico.png" alt="logoamico" />
            <h2>Sign-in to join our space</h2>
          </div>
        </div>

        <div className="login-right">
          <form className="login-box" onSubmit={handleSubmit}>
            <div className="avatar">👤</div>
            <h2>Hello Welcome</h2>

            {loginError && <p className="error-message">{loginError}</p>}

            <label>Email :</label>
            <input type="email" name="email" value={user.email}
              onChange={handleInputChange} placeholder="Username" required />

            <label>Password :</label>
            <div className="password-box">
              <input type="password" name="password" value={user.password} onChange={handleInputChange} placeholder="Password" required />
            </div>

            <Link to='/forgotpasswordpage' className="forgot-password">Forgot Password?</Link>

            <button type="submit">Sign in</button>

            <div className="divider"><span>or</span></div>

            <div className="social-login">
              <button className="google">G</button>
              <button className="facebook">f</button>
              <button className="linkedin">in</button>
            </div>

            <p className="signup-text">Don't Have an account? <Link to='/signuppage'>Sign up</Link></p>
          </form>
        </div>
      </div>
    </div>



  )
}

export default Loginpage