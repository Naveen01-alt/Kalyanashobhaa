import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Assuming you use react-router
import './AdminLogin.css';
import AdminNavbar from "../Components/AdminNavbar.jsx"
const AdminLogin = () => {
    const navigate = useNavigate();

    // State management
    const [step, setStep] = useState(1); // 1 = Creds, 2 = OTP
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Base URL from your screenshots
    const API_BASE = "https://kalyanashobha-back.vercel.app/api/admin/auth";

    // --- STEP 1: SEND PASSWORD ---
    const handleLoginInit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await axios.post(`${API_BASE}/login-init`, {
                email,
                password
            });

            if (res.data.success) {
                setStep(2);
                setMessage({ type: 'success', text: 'OTP sent to your email.' });
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || "Login failed. Check credentials.";
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setIsLoading(false);
        }
    };

    // --- STEP 2: VERIFY OTP ---
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await axios.post(`${API_BASE}/login-verify`, {
                email,
                otp
            });

            if (res.data.success) {
                // 1. Store Token
                localStorage.setItem('adminToken', res.data.token);
                // 2. Store User Info (optional)
                localStorage.setItem('adminInfo', JSON.stringify(res.data.admin));

                // 3. Redirect
                setMessage({ type: 'success', text: 'Login Successful! Redirecting...' });
                setTimeout(() => {
                    navigate('/admin/dashboard'); // Change this to your actual dashboard route
                }, 1000);
            }
        } catch (err) {
            const errMsg = err.response?.data?.message || "Invalid OTP.";
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <>
        <AdminNavbar/>

        <div className="admin-login-container">
            <div className="login-card">

                {/* Header */}
                <div className="login-header">
                    <h2>KalyanaShobha</h2>
                    <p>{step === 1 ? 'Admin Portal Access' : 'Security Verification'}</p>
                </div>

                {/* Alerts */}
                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* --- STEP 1 FORM --- */}
                {step === 1 && (
                    <form onSubmit={handleLoginInit}>
                        <div className="form-group">
                            <label>Admin Email</label>
                            <input 
                                type="email" 
                                className="form-control" 
                                placeholder="Enter admin email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                className="form-control" 
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Secure Login'}
                        </button>
                    </form>
                )}

                {/* --- STEP 2 FORM --- */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="form-group">
                            <label>Enter OTP</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                placeholder="6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required 
                                autoFocus
                            />
                            <small style={{display:'block', marginTop:'5px', color:'#777'}}>
                                Check inbox for {email}
                            </small>
                        </div>

                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify & Enter Dashboard'}
                        </button>

                        <div className="back-link" onClick={() => setStep(1)}>
                            &larr; Back to Login
                        </div>
                    </form>
                )}
            </div>
        </div>
              </>
    );
};

export default AdminLogin;