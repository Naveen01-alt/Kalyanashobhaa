import React, { useState, useRef, useEffect } from 'react';
import Navbar from "../User/Components/Navbar.jsx"; 
import { useNavigate } from 'react-router-dom';
import './AgentLogin.css'; 

const API_BASE = "https://kalyanashobha-back.vercel.app/api/agent";

const AgentLogin = () => {
  const navigate = useNavigate();
  
  const [view, setView] = useState('login'); // 'login' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const otpRefs = useRef([]);

  // Timer states for Resend OTP
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (localStorage.getItem('agentToken')) {
      navigate('/agent/dashboard');
    }
  }, [navigate]);

  // Countdown Timer Logic
  useEffect(() => {
    if (view === 'otp' && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (view === 'otp' && timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, view]);

  const handleLoginInit = async (e) => {
    e.preventDefault();
    setAuthLoading(true); 
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login-init`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setView('otp');
        setTimeLeft(30); // Start timer when entering OTP view
        setCanResend(false);
      } else {
        setAuthError(data.message);
      }
    } catch (e) { 
      setAuthError("Server Error"); 
    } finally { 
      setAuthLoading(false); 
    }
  };

  const handleVerifyOtp = async () => {
    setAuthLoading(true); 
    setAuthError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login-verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join("") })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('agentToken', data.token);
        localStorage.setItem('agentInfo', JSON.stringify(data.agent));
        navigate('/agent/dashboard'); 
      } else {
        setAuthError(data.message);
      }
    } catch (e) { 
      setAuthError("Verification Failed"); 
    } finally { 
      setAuthLoading(false); 
    }
  };

  // --- NEW: Resend OTP Logic ---
  const handleResendOtp = async () => {
    if (!canResend) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      // Re-trigger the login-init API to send a fresh OTP
      const res = await fetch(`${API_BASE}/auth/login-init`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }) // We still have password in state
      });
      const data = await res.json();
      if (data.success) {
        setOtp(new Array(6).fill("")); // Clear old OTP boxes
        setTimeLeft(30); // Reset timer
        setCanResend(false);
        otpRefs.current[0]?.focus(); // Focus back on the first box
      } else {
        setAuthError(data.message);
      }
    } catch (e) {
      setAuthError("Failed to resend OTP");
    } finally {
      setAuthLoading(false);
    }
  };

  // --- OTP Input Handlers ---
  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    if (val !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.some(isNaN)) return;

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    otpRefs.current[focusIndex]?.focus();
  };

  return (
    <>
      <Navbar />
      <div className="al-layout-wrapper">
        <div id="al-auth-container" className="al-login-container al-fade-in">
          
          <div className="al-auth-header">
            <h2>Agent Portal</h2>
            <p>Secure access for partners</p>
          </div>
          
          {view === 'login' ? (
            <form id="al-login-form" onSubmit={handleLoginInit}>
              <div className="al-input-group">
                <label htmlFor="al-email-input">Email Address</label>
                <input 
                  id="al-email-input"
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="al-input-group">
                <label htmlFor="al-password-input">Password</label>
                <input 
                  id="al-password-input"
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
              
              {authError && <div className="al-auth-error">{authError}</div>}
              
              <button 
                id="al-submit-btn"
                type="submit" 
                className="al-btn-primary al-full-width" 
                disabled={authLoading}
              >
                {authLoading ? <span className="al-spinner-sm"></span> : "Verify Credentials"}
              </button>
            </form>
          ) : (
            <div id="al-otp-section" className="al-otp-container">
              <p className="al-otp-instruction">Enter 6-digit code sent to {email}</p>
              
              <div className="al-otp-inputs">
                {otp.map((d, i) => (
                  <input 
                    key={i} 
                    id={`al-otp-input-${i}`}
                    ref={el => otpRefs.current[i] = el} 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={d} 
                    onChange={e => handleOtpChange(e, i)} 
                    onKeyDown={e => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    maxLength={2} 
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {/* --- RESEND OTP UI --- */}
              <div className="al-resend-container">
                {canResend ? (
                  <p>Didn't receive the code? <span className="al-resend-link" onClick={handleResendOtp}>Resend Now</span></p>
                ) : (
                  <p>Resend OTP in <strong>{timeLeft}s</strong></p>
                )}
              </div>
              
              {authError && <div className="al-auth-error">{authError}</div>}
              
              <button 
                id="al-verify-btn"
                onClick={handleVerifyOtp} 
                className="al-btn-primary al-full-width" 
                disabled={authLoading || otp.join("").length < 6} // Disabled if incomplete
              >
                {authLoading ? <span className="al-spinner-sm"></span> : "Access Dashboard"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AgentLogin;
