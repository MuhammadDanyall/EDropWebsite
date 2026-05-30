import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'customer',
        otp: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isAgreed, setIsAgreed] = useState(false);
    const modalContentRef = useRef(null);

    useEffect(() => {
        setMode(initialMode);
        setMessage({ type: '', text: '' });
        setIsAgreed(false);
    }, [initialMode, isOpen]);

    // Scroll modal to top when message or mode changes
    useEffect(() => {
        if (modalContentRef.current) {
            modalContentRef.current.scrollTop = 0;
        }
    }, [message, mode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return regex.test(password);
    };

    // --- STEP 3: LOGIN LOGIC ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email: formData.email,
                password: formData.password
            });

            setMessage({ type: 'success', text: res.data.message });

            if (res.data.otpRequired) {
                setMode('verifyAdminOtp');
            } else {
                // Save user data in browser (SessionStorage)
                sessionStorage.setItem('user', JSON.stringify(res.data.user));
                window.dispatchEvent(new Event("storage")); // Trigger header reload

                // Close modal after 1.5 seconds
                setTimeout(() => {
                    onClose();
                    if (res.data.user && res.data.user.role === 'admin') {
                        window.location.href = '/admin-panel';
                    }
                }, 1000);
            }

        } catch (err) {
            console.error("Login Error:", err.response?.data || err.message);
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Login failed! Check credentials. ❌'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setMessage({ type: 'error', text: 'Passwords do not match!' });
        }

        if (!validatePassword(formData.password)) {
            return setMessage({ 
                type: 'error', 
                text: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
            });
        }

        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
                fullName: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                role: formData.role
            });

            setMessage({ type: 'success', text: res.data.message });
            setTimeout(() => setMode('login'), 2000);
        } catch (err) {
            console.error("Signup Error:", err.response?.data || err.message);
            const errorData = err.response?.data;
            let errorMsg = 'Signup failed! ❌';
            if (errorData?.errors && errorData.errors.length > 0) {
                errorMsg = errorData.errors[0].msg;
            } else if (errorData?.message) {
                errorMsg = errorData.message;
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
                email: formData.email
            });
            setMessage({ type: 'success', text: res.data.message });
            setTimeout(() => {
                setMode('verifyOtp');
            }, 1000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error requesting OTP!' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
                email: formData.email,
                otp: formData.otp
            });
            setMessage({ type: 'success', text: res.data.message });
            setTimeout(() => {
                setMode('resetPassword');
            }, 1000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid OTP!' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyAdminOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/verify-admin-otp`, {
                email: formData.email,
                otp: formData.otp
            });
            setMessage({ type: 'success', text: res.data.message });
            
            // Save user data in browser (SessionStorage)
            sessionStorage.setItem('user', JSON.stringify(res.data.user));
            window.dispatchEvent(new Event("storage")); // Trigger header reload

            setTimeout(() => {
                onClose();
                window.location.href = '/admin-panel';
            }, 1000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid OTP!' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setMessage({ type: 'error', text: 'Passwords do not match!' });
        }

        if (!validatePassword(formData.password)) {
            return setMessage({ 
                type: 'error', 
                text: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
            });
        }
        setIsLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.password
            });
            setMessage({ type: 'success', text: res.data.message });
            setTimeout(() => {
                setMode('login');
            }, 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error resetting password!' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="auth-modal" className="auth-modal visible" onClick={(e) => e.target.id === 'auth-modal' && onClose()}>
            <div className="auth-modal-content" ref={modalContentRef}>
                <span className="close-button" onClick={onClose}>&times;</span>

                {message.text && (
                    <div style={{
                        padding: '10px',
                        marginBottom: '10px',
                        borderRadius: '5px',
                        backgroundColor: message.type === 'success' ? '#2ecc71' : '#e74c3c',
                        color: 'white', textAlign: 'center'
                    }}>
                        {message.text}
                    </div>
                )}

                <div id="auth-form-container">
                    {mode === 'login' && (
                        <div className="auth-form-content">
                            <h2>LOGIN</h2>
                            {/* Connected handleLogin with the form */}
                            <form id="login-form" onSubmit={handleLogin}>
                                <div className="form-group">
                                    <label>Email or Phone</label>
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="Email or phone"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter password"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button type="submit" className="auth-submit-btn" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Login'}</button>
                            </form>
                            <p style={{ marginTop: '10px', marginBottom: '10px' }}>
                                <a href="#" onClick={(e) => { e.preventDefault(); setMode('forgotPassword'); }} style={{ color: '#e74c3c' }}>Forgot Password?</a>
                            </p>
                            <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }}>Sign Up</a></p>
                        </div>
                    )}
                    {mode === 'signup' && (
                        <div className="auth-form-content">
                            <h2>SIGN UP</h2>
                            <form id="signup-form" onSubmit={handleSignup}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" name="username" placeholder="Enter username" onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" placeholder="Enter email" onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="tel" name="phone" placeholder="Enter phone" onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Role</label>
                                    <select name="role" onChange={handleChange} className="form-control" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                                        <option value="customer">Customer</option>
                                        <option value="driver">Driver</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" name="password" placeholder="Create password" onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <input type="password" name="confirmPassword" placeholder="Confirm password" onChange={handleChange} required />
                                </div>
                                <div className="form-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="terms-agreed" 
                                        checked={isAgreed} 
                                        onChange={(e) => setIsAgreed(e.target.checked)} 
                                        style={{ width: 'auto', marginBottom: '0' }}
                                        required 
                                    />
                                    <label htmlFor="terms-agreed" style={{ fontSize: '0.85rem', color: '#666', cursor: 'pointer' }}>
                                        I agree to the <Link to="/terms-conditions" onClick={onClose} style={{ color: '#ff6b35', fontWeight: '600' }}>Terms & Conditions</Link> and <Link to="/privacy-policy" onClick={onClose} style={{ color: '#ff6b35', fontWeight: '600' }}>Privacy Policy</Link>
                                    </label>
                                </div>
                                <button type="submit" className="auth-submit-btn" disabled={isLoading || !isAgreed}>
                                    {isLoading ? 'Please wait...' : 'Sign Up'}
                                </button>
                            </form>
                            <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Login</a></p>
                        </div>
                    )}
                    {mode === 'forgotPassword' && (
                        <div className="auth-form-content">
                            <h2>FORGOT PASSWORD</h2>
                            <form onSubmit={handleForgotPassword}>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" name="email" placeholder="Enter your email" onChange={handleChange} required />
                                </div>
                                <button type="submit" className="auth-submit-btn" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Send OTP'}</button>
                            </form>
                            <p style={{ marginTop: '15px' }}>Remember your password? <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Login</a></p>
                        </div>
                    )}
                    {mode === 'verifyOtp' && (
                        <div className="auth-form-content">
                            <h2>VERIFY OTP</h2>
                            <form onSubmit={handleVerifyOtp}>
                                <div className="form-group">
                                    <label>Enter 6-digit OTP</label>
                                    <input type="text" name="otp" placeholder="Enter OTP sent to email" onChange={handleChange} required />
                                </div>
                                <button type="submit" className="auth-submit-btn" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Verify OTP'}</button>
                            </form>
                        </div>
                    )}
                    {mode === 'verifyAdminOtp' && (
                        <div className="auth-form-content">
                            <h2>ADMIN SECURITY</h2>
                            <p style={{marginBottom: '15px', color: '#666', fontSize: '0.9rem', textAlign: 'center'}}>
                                Please enter the 6-digit OTP sent to your admin email.
                            </p>
                            <form onSubmit={handleVerifyAdminOtp}>
                                <div className="form-group">
                                    <label>Enter Admin OTP</label>
                                    <input type="text" name="otp" placeholder="Enter Admin OTP" onChange={handleChange} required />
                                </div>
                                <button type="submit" className="auth-submit-btn" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Verify & Login'}</button>
                            </form>
                            <p style={{ marginTop: '15px' }}><a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>Back to Login</a></p>
                        </div>
                    )}
                    {mode === 'resetPassword' && (
                        <div className="auth-form-content">
                            <h2>RESET PASSWORD</h2>
                            <form onSubmit={handleResetPassword}>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input type="password" name="password" placeholder="Enter new password" onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Confirm New Password</label>
                                    <input type="password" name="confirmPassword" placeholder="Confirm new password" onChange={handleChange} required />
                                </div>
                                <button type="submit" className="auth-submit-btn" disabled={isLoading}>{isLoading ? 'Please wait...' : 'Reset Password'}</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
