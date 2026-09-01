// src/components/AuthModal.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser, verifyOTP, forgotPassword, resetPassword } from '../services/api';
import aashrayLogo from '../assets/Aasray.svg';

const AuthModal = () => {
    // views: 'login' | 'register' | 'otp' | 'forgot' | 'reset'
    const [view, setView] = useState('login');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // Password visibility toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { setUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- LOGIN ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage({ type: '', text: '' });

        try {
            const res = await loginUser({
                email: formData.email,
                password: formData.password
            });

            if (res.data && res.data.success) {
                setUser(res.data.user);
                setStatusMessage({ type: 'success', text: 'Login successful! Redirecting...' });
                setTimeout(() => navigate('/dashboard', { replace: true }), 500);
            }
        } catch (err) {
            setStatusMessage({
                type: 'danger',
                text: err.response?.data?.message || 'Authentication failed'
            });
        } finally {
            setLoading(false);
        }
    };

    // --- REGISTER ---
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage({ type: '', text: '' });
        try {
            const res = await registerUser(formData);
            setStatusMessage({ type: 'success', text: res.data.message });
            setView('otp');
        } catch (err) {
            setStatusMessage({
                type: 'danger',
                text: err.response?.data?.message || 'Registration failed'
            });
        } finally {
            setLoading(false);
        }
    };

    // --- VERIFY REGISTER OTP ---
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage({ type: '', text: '' });
        try {
            const res = await verifyOTP({ email: formData.email, otp: formData.otp });
            setStatusMessage({ type: 'success', text: res.data.message });
            setTimeout(() => setView('login'), 1500);
        } catch (err) {
            setStatusMessage({
                type: 'danger',
                text: err.response?.data?.message || 'Verification failed'
            });
        } finally {
            setLoading(false);
        }
    };

    // --- FORGOT PASSWORD (REQUEST OTP) ---
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage({ type: '', text: '' });
        try {
            const res = await forgotPassword({ email: formData.email });
            setStatusMessage({ type: 'success', text: res.data.message });
            setView('reset');
        } catch (err) {
            setStatusMessage({
                type: 'danger',
                text: err.response?.data?.message || 'Failed to send reset code.'
            });
        } finally {
            setLoading(false);
        }
    };

    // --- RESET PASSWORD (SUBMIT NEW PASS) ---
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            setStatusMessage({ type: 'danger', text: 'Passwords do not match.' });
            return;
        }

        setLoading(true);
        setStatusMessage({ type: '', text: '' });
        try {
            const res = await resetPassword({
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword
            });
            setStatusMessage({ type: 'success', text: res.data.message });
            setTimeout(() => {
                setView('login');
                setStatusMessage({ type: '', text: '' });
            }, 2000);
        } catch (err) {
            setStatusMessage({
                type: 'danger',
                text: err.response?.data?.message || 'Password reset failed.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5 position-relative" style={{ zIndex: 1 }}>
            <div className="cyber-card p-4 p-md-5" style={{ maxWidth: '450px', width: '100%' }}>

                {/* Logo Header */}
                <div className="text-center mb-4">
                    <img
                        src={aashrayLogo}
                        alt="Aashray Logo"
                        className="mb-2"
                        style={{ width: '70px', height: '70px', filter: 'drop-shadow(0 0 12px rgba(0, 240, 255, 0.45))' }}
                    />
                    <h3 className="fw-bold tracking-wider text-white mb-0" style={{ letterSpacing: '1px' }}>AASHRAY</h3>
                    <span className="text-subtext small">Secure Identity & Booking Portal</span>
                </div>

                {/* Tab Switcher (Visible on login & register) */}
                {(view === 'login' || view === 'register') && (
                    <div className="d-flex bg-dark p-1 rounded-3 mb-4 border border-secondary border-opacity-25">
                        <button
                            type="button"
                            className={`btn flex-fill py-2 text-sm fw-semibold rounded-2 ${view === 'login' ? 'btn-secondary text-white' : 'text-subtext'}`}
                            onClick={() => { setView('login'); setStatusMessage({ type: '', text: '' }); }}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            className={`btn flex-fill py-2 text-sm fw-semibold rounded-2 ${view === 'register' ? 'btn-secondary text-white' : 'text-subtext'}`}
                            onClick={() => { setView('register'); setStatusMessage({ type: '', text: '' }); }}
                        >
                            Register
                        </button>
                    </div>
                )}

                {/* Notifications */}
                {statusMessage.text && (
                    <div className={`alert alert-${statusMessage.type} py-2 px-3 small d-flex align-items-center mb-3`} role="alert">
                        <i className={`fa-solid ${statusMessage.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} me-2`}></i>
                        <div>{statusMessage.text}</div>
                    </div>
                )}

                {/* 1. LOGIN VIEW */}
                {view === 'login' && (
                    <form onSubmit={handleLogin}>
                        <div className="mb-3 position-relative">
                            <input
                                type="email"
                                name="email"
                                className="form-control cyber-input"
                                placeholder="Email Address"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <span className="input-icon-wrapper"><i className="fa-regular fa-envelope"></i></span>
                        </div>

                        <div className="mb-2 position-relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-control cyber-input pe-5"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <span className="input-icon-wrapper"><i className="fa-solid fa-lock"></i></span>
                            <span
                                className="password-toggle-wrapper"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? 'Hide Password' : 'Show Password'}
                            >
                                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </span>
                        </div>

                        <div className="text-end mb-3">
                            <button
                                type="button"
                                className="btn btn-link text-cyan-glow p-0 text-decoration-none small"
                                onClick={() => { setView('forgot'); setStatusMessage({ type: '', text: '' }); }}
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <button type="submit" className="btn btn-lightning w-100 py-2" disabled={loading}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : <i className="fa-solid fa-bolt me-2"></i>}
                            Sign In
                        </button>
                    </form>
                )}

                {/* 2. REGISTER VIEW */}
                {view === 'register' && (
                    <form onSubmit={handleRegister}>
                        <div className="mb-3 position-relative">
                            <input
                                type="text"
                                name="username"
                                className="form-control cyber-input"
                                placeholder="Full Name"
                                required
                                value={formData.username}
                                onChange={handleChange}
                            />
                            <span className="input-icon-wrapper"><i className="fa-regular fa-user"></i></span>
                        </div>

                        <div className="mb-3 position-relative">
                            <input
                                type="email"
                                name="email"
                                className="form-control cyber-input"
                                placeholder="Email Address"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <span className="input-icon-wrapper"><i className="fa-regular fa-envelope"></i></span>
                        </div>

                        <div className="mb-3 position-relative">
                            <input
                                type="tel"
                                name="phone"
                                className="form-control cyber-input"
                                placeholder="Phone Number"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <span className="input-icon-wrapper"><i className="fa-solid fa-phone"></i></span>
                        </div>

                        <div className="mb-4 position-relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-control cyber-input pe-5"
                                placeholder="Create Password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <span className="input-icon-wrapper"><i className="fa-solid fa-key"></i></span>
                            <span
                                className="password-toggle-wrapper"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? 'Hide Password' : 'Show Password'}
                            >
                                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </span>
                        </div>

                        <button type="submit" className="btn btn-lightning w-100 py-2" disabled={loading}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : <i className="fa-solid fa-user-shield me-2"></i>}
                            Register Account
                        </button>
                    </form>
                )}

                {/* 3. VERIFY REGISTRATION OTP */}
                {view === 'otp' && (
                    <form onSubmit={handleVerifyOTP}>
                        <div className="text-center mb-3">
                            <p className="small text-subtext mb-0">Enter 6-digit OTP sent to <strong>{formData.email}</strong></p>
                        </div>
                        <div className="mb-4 position-relative">
                            <input
                                type="text"
                                name="otp"
                                maxLength="6"
                                className="form-control cyber-input text-center fw-bold fs-4"
                                placeholder="000000"
                                style={{ letterSpacing: '6px' }}
                                required
                                value={formData.otp}
                                onChange={handleChange}
                            />
                            <span className="input-icon-wrapper"><i className="fa-solid fa-fingerprint"></i></span>
                        </div>
                        <button type="submit" className="btn btn-lightning w-100 py-2" disabled={loading}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : 'Verify & Complete'}
                        </button>
                        <button type="button" className="btn btn-link w-100 text-subtext small mt-2" onClick={() => setView('login')}>
                            Back to Login
                        </button>
                    </form>
                )}

                {/* 4. FORGOT PASSWORD (REQUEST OTP) */}
                {view === 'forgot' && (
                    <form onSubmit={handleForgotPassword}>
                        <div className="text-center mb-3">
                            <h5 className="fw-bold text-white mb-1">Reset Password</h5>
                            <p className="small text-subtext">Enter your registered email to receive a recovery OTP code.</p>
                        </div>

                        <div className="mb-4 position-relative">
                            <input
                                type="email"
                                name="email"
                                className="form-control cyber-input"
                                placeholder="Your Registered Email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <span className="input-icon-wrapper"><i className="fa-regular fa-envelope"></i></span>
                        </div>

                        <button type="submit" className="btn btn-lightning w-100 py-2" disabled={loading}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : <i className="fa-solid fa-paper-plane me-2"></i>}
                            Send Recovery Code
                        </button>

                        <button type="button" className="btn btn-link w-100 text-subtext small mt-2" onClick={() => setView('login')}>
                            Back to Sign In
                        </button>
                    </form>
                )}

                {/* 5. RESET PASSWORD (ENTER OTP & NEW PASSWORD) */}
                {view === 'reset' && (
                    <form onSubmit={handleResetPassword}>
                        <div className="text-center mb-3">
                            <h5 className="fw-bold text-white mb-1">Enter Verification Code</h5>
                            <p className="small text-subtext">Recovery code sent to <strong>{formData.email}</strong></p>
                        </div>

                        <div className="mb-3 position-relative">
                            <input
                                type="text"
                                name="otp"
                                maxLength="6"
                                className="form-control cyber-input text-center fw-bold fs-5"
                                placeholder="6-Digit OTP"
                                style={{ letterSpacing: '4px' }}
                                required
                                value={formData.otp}
                                onChange={handleChange}
                            />
                            <span className="input-icon-wrapper"><i className="fa-solid fa-key"></i></span>
                        </div>

                        <div className="mb-3 position-relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                name="newPassword"
                                className="form-control cyber-input pe-5"
                                placeholder="New Password (min 8 chars)"
                                required
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                            <span className="input-icon-wrapper"><i className="fa-solid fa-lock"></i></span>
                            <span
                                className="password-toggle-wrapper"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                title={showNewPassword ? 'Hide Password' : 'Show Password'}
                            >
                                <i className={`fa-regular ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </span>
                        </div>

                        <div className="mb-4 position-relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                className="form-control cyber-input pe-5"
                                placeholder="Confirm New Password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <span className="input-icon-wrapper"><i className="fa-solid fa-shield-check"></i></span>
                            <span
                                className="password-toggle-wrapper"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                            >
                                <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </span>
                        </div>

                        <button type="submit" className="btn btn-lightning w-100 py-2" disabled={loading}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : <i className="fa-solid fa-check me-2"></i>}
                            Update & Reset Password
                        </button>

                        <button type="button" className="btn btn-link w-100 text-subtext small mt-2" onClick={() => setView('login')}>
                            Cancel & Return to Login
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default AuthModal;