import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./forgotpasswordpage.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: success
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Auto-navigate after success (2 seconds delay)
  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        navigate("/loginpage");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (!email) {
        setMessage("Please enter your registered email.");
        return;
      }

      const res = await axios.post("http://localhost:5000/users/send-otp", { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (newPassword !== confirmPassword) {
        setMessage("New password and confirm password do not match.");
        return;
      }
      if (!otp || !newPassword) {
        setMessage("Please enter the OTP and a new password.");
        return;
      }

      const res = await axios.post("http://localhost:5000/users/reset-password", {
        email,
        otp,
        newPassword,
      });
      setMessage(res.data.message);
      setStep(3); // ✅ success step
    } catch (err) {
      setMessage(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <h2>Forgot Password</h2>

        {/* Display message */}
        {message && <p className={`message ${step === 3 ? "success" : ""}`}>{message}</p>}

        {/* Step 1: Email Input */}
        <div className="step-group">
          <label className="step-label">Enter your registered email</label>
          <form onSubmit={handleSendOtp} className="email-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={step > 1}
            />
            {step === 1 && (
              <button type="submit" className="send-otp-btn">
                Send OTP
              </button>
            )}
          </form>
        </div>

        <hr />

        {/* Step 2: OTP + New Password */}
        <div className={`step-group ${step < 2 ? "disabled-step" : ""}`}>
          <label className="step-label">Reset your password</label>
          <form onSubmit={handleResetPassword} className="reset-form">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={step < 2 || step === 3}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={step < 2 || step === 3}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={step < 2 || step === 3}
            />
            {step === 2 && (
              <button type="submit" className="reset-password-btn">
                Reset Password
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
