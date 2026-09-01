// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword, fetchMyBookings } from '../services/api';
import aashrayLogo from '../assets/Aasray.svg';

const Profile = () => {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();

    // Booking & Activity State
    const [bookings, setBookings] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Settings Modal State
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState('profile'); // 'profile' | 'password'

    // Profile Form State
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        phone: user?.phone || '',
        email: user?.email || '',
    });
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [loadingPass, setLoadingPass] = useState(false);

    // Alerts
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    // Fetch Activity / Reservations
    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetchMyBookings();
            if (res.data.success) {
                setBookings(res.data.bookings || []);
            }
        } catch (err) {
            console.error('Failed to fetch activity history', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        loadHistory();
        if (user) {
            setProfileData({
                username: user.username || '',
                phone: user.phone || '',
                email: user.email || '',
            });
        }
    }, [user]);

    // Handle Profile Details Update
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const res = await updateProfile({
                username: profileData.username,
                phone: profileData.phone,
            });
            if (res.data.success) {
                setUser(res.data.user);
                setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
                setShowSettingsModal(false);
            }
        } catch (err) {
            setStatusMsg({
                type: 'danger',
                text: err.response?.data?.message || 'Failed to update profile.',
            });
        } finally {
            setLoadingProfile(false);
        }
    };

    // Handle Password Update
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setStatusMsg({ type: 'danger', text: 'New passwords do not match.' });
            return;
        }

        setLoadingPass(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const res = await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            if (res.data.success) {
                setStatusMsg({ type: 'success', text: 'Password changed successfully!' });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowSettingsModal(false);
            }
        } catch (err) {
            setStatusMsg({
                type: 'danger',
                text: err.response?.data?.message || 'Failed to change password.',
            });
        } finally {
            setLoadingPass(false);
        }
    };

    return (
        <div className="container-fluid px-lg-5 py-3 py-md-4 min-vh-100 position-relative text-white" style={{ zIndex: 1 }}>

            {/* Top Header Navbar */}
            <header className="cyber-card p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                    <Link to="/dashboard">
                        <img
                            src={aashrayLogo}
                            alt="Aashray Logo"
                            style={{ width: '45px', height: '45px', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.45))' }}
                        />
                    </Link>
                    <div>
                        <h4 className="mb-0 fw-bold text-white tracking-wide">ACCOUNT SANCTUARY</h4>
                        <span className="small text-subtext">Identity Verification & Activity History</span>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    {/* <button
                        onClick={() => setShowSettingsModal(true)}
                        className="btn btn-action btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                        title="Account Settings"
                    >
                        <i className="fa-solid fa-gear text-cyan-glow"></i>
                        <span>Settings</span>
                    </button> */}

                    <Link to="/dashboard" className="btn btn-action btn-sm px-3 py-2">
                        <i className="fa-solid fa-arrow-left me-1"></i>Discover
                    </Link>

                    <button
                        onClick={async () => { await logout(); navigate('/login'); }}
                        className="btn btn-outline-danger btn-sm px-3 py-2 fw-semibold"
                    >
                        <i className="fa-solid fa-right-from-bracket me-1"></i>Logout
                    </button>
                </div>
            </header>

            {/* Global Status Message */}
            {statusMsg.text && (
                <div className={`alert alert-${statusMsg.type} alert-dismissible fade show cyber-card text-white mb-4`} role="alert">
                    <i className={`fa-solid ${statusMsg.type === 'success' ? 'fa-circle-check text-success' : 'fa-triangle-exclamation text-danger'} me-2`}></i>
                    {statusMsg.text}
                    <button type="button" className="btn-close btn-close-white" onClick={() => setStatusMsg({ type: '', text: '' })}></button>
                </div>
            )}

            {/* Profile Layout */}
            <div className="row g-4">

                {/* Left Column: ID Card */}
                <div className="col-12 col-lg-4">
                    <div className="cyber-card p-4 text-center position-sticky" style={{ top: '20px' }}>

                        {/* Settings Trigger Icon on ID Card */}
                        <div className="text-end">
                            <button
                                onClick={() => setShowSettingsModal(true)}
                                className="btn btn-sm btn-outline-secondary rounded-circle border-0 text-subtext"
                                title="Edit Identity & Security"
                            >
                                <i className="fa-solid fa-gear fs-5 text-cyan-glow"></i>
                            </button>
                        </div>

                        {/* Profile Avatar Badge */}
                        <div
                            className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3 border border-info border-opacity-50"
                            style={{
                                width: '95px',
                                height: '95px',
                                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 0, 0, 0.7))',
                                boxShadow: '0 0 25px rgba(0, 240, 255, 0.35)'
                            }}
                        >
                            <span className="fs-1 fw-bold text-cyan-glow text-uppercase">
                                {user?.username ? user.username.charAt(0) : 'U'}
                            </span>
                        </div>

                        <h4 className="fw-bold text-white mb-1">{user?.username || 'Verified Traveler'}</h4>
                        <p className="text-subtext small mb-3">{user?.email}</p>

                        <div className="d-flex justify-content-center gap-2 mb-4">
                            <span className={`badge ${user?.role === 'Admin' ? 'bg-danger' : user?.role === 'Owner' ? 'bg-warning text-dark' : 'bg-info text-dark'} px-3 py-2 rounded-pill fw-bold`}>
                                <i className="fa-solid fa-shield-halved me-1"></i>{user?.role || 'Guest'}
                            </span>
                            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-2 rounded-pill fw-bold">
                                <i className="fa-solid fa-circle-check me-1"></i>Verified ID
                            </span>
                        </div>

                        <hr className="border-secondary border-opacity-25 my-3" />

                        <div className="text-start d-flex flex-column gap-3 small">
                            <div className="d-flex justify-content-between">
                                <span className="text-subtext"><i className="fa-solid fa-phone me-2 text-info"></i>Phone:</span>
                                <span className="text-detail fw-semibold">{user?.phone || 'Not provided'}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-subtext"><i className="fa-solid fa-fingerprint me-2 text-info"></i>Account ID:</span>
                                <span className="text-detail font-monospace" style={{ fontSize: '11px' }}>{user?.id || user?._id || 'UID-7708'}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-subtext"><i className="fa-solid fa-suitcase me-2 text-info"></i>Completed Trips:</span>
                                <span className="text-cyan-glow fw-bold">{bookings.length}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
                            <button onClick={() => setShowSettingsModal(true)} className="btn btn-lightning w-100 py-2 btn-sm fw-bold">
                                <i className="fa-solid fa-sliders me-2"></i>Account & Security Settings
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity & History Feed */}
                <div className="col-12 col-lg-8">
                    <div className="cyber-card p-4 p-md-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 className="fw-bold text-white mb-1">
                                    <i className="fa-solid fa-clock-rotate-left me-2 text-cyan-glow"></i>Activity & Stay History
                                </h5>
                                <span className="text-subtext small">Recent sanctuary reservations and check-in logs</span>
                            </div>
                            <span className="badge bg-dark border border-secondary border-opacity-50 text-detail px-3 py-2">
                                {bookings.length} Total Logs
                            </span>
                        </div>

                        {loadingHistory ? (
                            <div className="text-center py-5 text-subtext">
                                <i className="fa-solid fa-spinner fa-spin fs-3 mb-2 text-info"></i>
                                <p>Loading your activity stream...</p>
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="text-center py-5 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25">
                                <i className="fa-solid fa-mountain-sun fs-1 text-secondary mb-3"></i>
                                <h6 className="text-white">No Activity Logged Yet</h6>
                                <p className="text-subtext small mb-3">You haven't reserved any sanctuaries yet. Start exploring curated stays!</p>
                                <Link to="/dashboard" className="btn btn-action btn-sm px-4 py-2">
                                    Explore Sanctuaries
                                </Link>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {bookings.map((booking) => (
                                    <div key={booking._id} className="p-3 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25">
                                        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                                            <div>
                                                <h6 className="fw-bold text-white mb-0">{booking.hotel?.name || 'Sanctuary Stay'}</h6>
                                                <small className="text-subtext">
                                                    <i className="fa-solid fa-location-dot me-1 text-info"></i>{booking.hotel?.location || 'Verified Location'}
                                                </small>
                                            </div>
                                            <span className={`badge ${booking.status === 'Confirmed' ? 'bg-success bg-opacity-25 text-success border border-success border-opacity-50' : 'bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50'} px-2 py-1`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="row g-2 mt-2 pt-2 border-top border-secondary border-opacity-25 small text-subtext">
                                            <div className="col-6 col-md-3">
                                                <span className="d-block text-muted" style={{ fontSize: '11px' }}>CHECK-IN</span>
                                                <strong className="text-detail">{new Date(booking.checkInDate).toLocaleDateString()}</strong>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <span className="d-block text-muted" style={{ fontSize: '11px' }}>CHECK-OUT</span>
                                                <strong className="text-detail">{new Date(booking.checkOutDate).toLocaleDateString()}</strong>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <span className="d-block text-muted" style={{ fontSize: '11px' }}>GUESTS</span>
                                                <strong className="text-detail">{booking.guests} Guests</strong>
                                            </div>
                                            <div className="col-6 col-md-3 text-md-end">
                                                <span className="d-block text-muted" style={{ fontSize: '11px' }}>AMOUNT</span>
                                                <strong className="text-cyan-glow">₹{booking.totalPrice}</strong>
                                            </div>
                                        </div>

                                        <div className="mt-2 pt-2 text-muted font-monospace d-flex justify-content-between align-items-center" style={{ fontSize: '11px' }}>
                                            <span>Pass ID: {booking._id}</span>
                                            <span className="text-success"><i className="fa-solid fa-circle-check me-1"></i>Receipt Dispatched</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* ========================================== */}
            {/* SETTINGS POPUP MODAL (EDIT PROFILE & PASS) */}
            {/* ========================================== */}
            {showSettingsModal && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3"
                    style={{ background: 'rgba(0,0,0,0.85)', zIndex: 1060, backdropFilter: 'blur(8px)' }}
                >
                    <div className="cyber-card p-4 p-md-5" style={{ maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>

                        {/* Modal Header */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <i className="fa-solid fa-gear text-cyan-glow fs-4"></i>
                                <h5 className="fw-bold text-white mb-0">Account Settings</h5>
                            </div>
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="btn btn-sm btn-outline-secondary rounded-circle"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="d-flex bg-dark p-1 rounded-3 mb-4 border border-secondary border-opacity-25">
                            <button
                                type="button"
                                className={`btn flex-fill py-2 text-sm fw-semibold rounded-2 ${activeSettingsTab === 'profile' ? 'btn-secondary text-white' : 'text-subtext'}`}
                                onClick={() => setActiveSettingsTab('profile')}
                            >
                                <i className="fa-solid fa-user-pen me-2"></i>Edit Profile
                            </button>
                            <button
                                type="button"
                                className={`btn flex-fill py-2 text-sm fw-semibold rounded-2 ${activeSettingsTab === 'password' ? 'btn-secondary text-white' : 'text-subtext'}`}
                                onClick={() => setActiveSettingsTab('password')}
                            >
                                <i className="fa-solid fa-key me-2"></i>Change Password
                            </button>
                        </div>

                        {/* TAB 1: EDIT PROFILE */}
                        {activeSettingsTab === 'profile' && (
                            <form onSubmit={handleProfileSubmit} className="d-flex flex-column gap-3">
                                <div>
                                    <label className="text-subtext small mb-1">Full Name</label>
                                    <div className="position-relative">
                                        <input
                                            type="text"
                                            required
                                            className="form-control cyber-input"
                                            value={profileData.username}
                                            onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                        />
                                        <span className="input-icon-wrapper"><i className="fa-regular fa-user"></i></span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-subtext small mb-1">Contact Phone</label>
                                    <div className="position-relative">
                                        <input
                                            type="tel"
                                            required
                                            className="form-control cyber-input"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        />
                                        <span className="input-icon-wrapper"><i className="fa-solid fa-phone"></i></span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-subtext small mb-1">Registered Email (Immutable)</label>
                                    <div className="position-relative">
                                        <input
                                            type="email"
                                            disabled
                                            className="form-control cyber-input bg-dark opacity-75"
                                            value={profileData.email}
                                        />
                                        <span className="input-icon-wrapper"><i className="fa-regular fa-envelope"></i></span>
                                    </div>
                                </div>

                                <button type="submit" disabled={loadingProfile} className="btn btn-lightning py-2 mt-2">
                                    {loadingProfile ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : <i className="fa-solid fa-floppy-disk me-2"></i>}
                                    Save Profile Details
                                </button>
                            </form>
                        )}

                        {/* TAB 2: CHANGE PASSWORD */}
                        {activeSettingsTab === 'password' && (
                            <form onSubmit={handlePasswordSubmit} className="d-flex flex-column gap-3">
                                <div>
                                    <label className="text-subtext small mb-1">Current Password</label>
                                    <div className="position-relative">
                                        <input
                                            type={showCurrentPass ? 'text' : 'password'}
                                            required
                                            className="form-control cyber-input pe-5"
                                            placeholder="Existing password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        />
                                        <span className="input-icon-wrapper"><i className="fa-solid fa-lock"></i></span>
                                        <span
                                            className="password-toggle-wrapper"
                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                        >
                                            <i className={`fa-regular ${showCurrentPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-subtext small mb-1">New Password</label>
                                    <div className="position-relative">
                                        <input
                                            type={showNewPass ? 'text' : 'password'}
                                            required
                                            className="form-control cyber-input pe-5"
                                            placeholder="Min 8 characters"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        />
                                        <span className="input-icon-wrapper"><i className="fa-solid fa-shield-halved"></i></span>
                                        <span
                                            className="password-toggle-wrapper"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                        >
                                            <i className={`fa-regular ${showNewPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-subtext small mb-1">Confirm New Password</label>
                                    <div className="position-relative">
                                        <input
                                            type={showNewPass ? 'text' : 'password'}
                                            required
                                            className="form-control cyber-input pe-5"
                                            placeholder="Repeat new password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        />
                                        <span className="input-icon-wrapper"><i className="fa-solid fa-check-double"></i></span>
                                    </div>
                                </div>

                                <button type="submit" disabled={loadingPass} className="btn btn-lightning py-2 mt-2">
                                    {loadingPass ? <i className="fa-solid fa-spinner fa-spin me-2"></i> : <i className="fa-solid fa-shield-check me-2"></i>}
                                    Update Password
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="text-center py-4 mt-5 border-top border-secondary border-opacity-25 text-subtext small">
                <div>&copy; {new Date().getFullYear()} Aashray Cryptographic Hospitality Network. Session Encrypted.</div>
            </footer>

        </div>
    );
};

export default Profile;