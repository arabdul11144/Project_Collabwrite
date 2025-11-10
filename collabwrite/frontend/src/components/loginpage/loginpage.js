import React, { useState } from 'react';
import './loginpage.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from "@react-oauth/google";







function Loginpage() {



  const navigate = useNavigate();
  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await sendRequest();
      console.log("Response:", response);

      if (response.message === "Login successful!") {
        console.log("Login successful");
        navigate('/homepage');
      } else {
        setLoginError(response.message || "Invalid email or password");
      }

    } catch (err) {
      console.error("Error during login:", err);

      // Handle specific backend error messages
      if (err.response && err.response.data && err.response.data.message) {
        // Show backend message directly ("User not found")
        setLoginError(err.response.data.message);
      } else {
        setLoginError("Server error. Please try again.");
      }
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
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={user.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? "🔓" : "🔒"}
              </span>
            </div>


            <Link to='/forgotpasswordpage' className="forgot-password">Forgot Password?</Link>

            <button type="submit">Sign in</button>

            <div className="divider"><span>or</span></div>

            <div className="social-login">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const token = credentialResponse.credential;

                    // Send token to backend
                    const res = await axios.post("http://localhost:5000/users/google-login", {
                      token
                    });

                    console.log("Google login response:", res.data);
                    if (res.data.user) {
                      navigate('/homepage');
                    }
                  } catch (err) {
                    console.error("Google login failed:", err);
                  }
                }}
                onError={() => {
                  console.log("Google login failed");
                }}
              />

            </div>

            <p className="signup-text">Don't Have an account? <Link to='/signuppage'>Sign up</Link></p>
          </form>
        </div>
      </div>
    </div>



  )
}

export default Loginpage;
