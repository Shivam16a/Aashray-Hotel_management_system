// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { socket } from '../services/socket';
import { playCyberAlertSound } from '../utils/audioAlert';
import { useAuth } from '../context/AuthContext';
import {
    fetchAllHotels,
    createHotelListing,
    updateHotelListing,
    deleteHotelListing,
    fetchAdminStats,
    fetchAllUsers,
    updateUserDetails,
    toggleBlockUser,
    deleteUserAccount,
    verifyCheckoutCode,
    fetchAllAdminBookings
} from '../services/api';
import aashrayLogo from '../assets/Aasray.svg';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Tab switcher: 'hotels' | 'users' | 'bookings'
    const [activeTab, setActiveTab] = useState('hotels');

    // Data states
    const [hotels, setHotels] = useState([]);
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ totalHotels: 0, totalBookings: 0, totalRevenue: 0 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    // Booking Search Filter
    const [bookingSearch, setBookingSearch] = useState('');

    // Checkout Verification State
    const [inputCheckoutCode, setInputCheckoutCode] = useState('');
    const [verifyingCheckout, setVerifyingCheckout] = useState(false);

    // Hotel Add / Edit Modal states
    const [showHotelModal, setShowHotelModal] = useState(false);
    const [isEditingHotel, setIsEditingHotel] = useState(false);
    const [currentHotelId, setCurrentHotelId] = useState(null);
    const [hotelFormData, setHotelFormData] = useState({
        name: '',
        description: '',
        location: '',
        city: '',
        pricePerNight: '',
        originalPrice: '',
        tag: 'Luxury Stay',
        images: '',
        amenities: '',
        availableRooms: 5,
    });

    // User Edit Modal state
    const [showUserModal, setShowUserModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userFormData, setUserFormData] = useState({
        username: '',
        email: '',
        phone: '',
        role: 'User',
        isVerified: true
    });

    useEffect(() => {
        // Join Admin Channel
        socket.emit('join-admin-room');

        // Real-Time New Booking Handler
        socket.on('new-booking-alert', (data) => {
            playCyberAlertSound();
            setStatusMsg({ type: 'success', text: `⚡ Real-Time Booking: ${data.message}` });
            setBookings((prev) => [data.booking, ...prev]);
            setStats((prev) => ({
                ...prev,
                totalBookings: prev.totalBookings + 1,
                totalRevenue: prev.totalRevenue + (data.booking.totalPrice || 0),
            }));
        });

        // Real-Time Checkout Sync Handler
        socket.on('admin-checkout-sync', (data) => {
            setBookings((prev) =>
                prev.map((b) => (b._id === data.bookingId ? { ...b, status: 'Checked-Out' } : b))
            );
        });

        return () => {
            socket.off('new-booking-alert');
            socket.off('admin-checkout-sync');
        };
    }, []);

    // Load All System Data
    const loadData = async () => {
        setLoading(true);
        try {
            const [hotelsRes, statsRes, usersRes, bookingsRes] = await Promise.all([
                fetchAllHotels(),
                fetchAdminStats(),
                fetchAllUsers(),
                fetchAllAdminBookings()
            ]);
            if (hotelsRes.data.success) setHotels(hotelsRes.data.hotels || []);
            if (statsRes.data.success) setStats(statsRes.data.stats || { totalHotels: 0, totalBookings: 0, totalRevenue: 0 });
            if (usersRes.data.success) setUsers(usersRes.data.users || []);
            if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings || []);
        } catch (err) {
            console.error('Failed to load admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role !== 'Admin' && user.role !== 'Owner') {
            navigate('/dashboard');
        } else {
            loadData();
        }
    }, [user]);

    // ==========================================
    // OWNER CHECKOUT VERIFICATION HANDLER
    // ==========================================
    const handleOwnerCheckoutVerify = async (e) => {
        e.preventDefault();
        if (!inputCheckoutCode.trim()) return;

        setVerifyingCheckout(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const res = await verifyCheckoutCode({ checkoutCode: inputCheckoutCode.trim() });
            if (res.data.success) {
                setStatusMsg({
                    type: 'success',
                    text: res.data.message || 'Checkout confirmed and stay locked!'
                });
                setInputCheckoutCode('');
                loadData();
            }
        } catch (err) {
            setStatusMsg({
                type: 'danger',
                text: err.response?.data?.message || 'Invalid or expired checkout pass.'
            });
        } finally {
            setVerifyingCheckout(false);
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 6000);
        }
    };

    // ==========================================
    // HOTEL HANDLERS (ADD, EDIT, DELETE)
    // ==========================================
    const handleOpenAddHotel = () => {
        setIsEditingHotel(false);
        setCurrentHotelId(null);
        setHotelFormData({
            name: '',
            description: '',
            location: '',
            city: '',
            pricePerNight: '',
            originalPrice: '',
            tag: 'Luxury Stay',
            images: '',
            amenities: '',
            availableRooms: 5,
        });
        setShowHotelModal(true);
    };

    const handleOpenEditHotel = (hotel) => {
        setIsEditingHotel(true);
        setCurrentHotelId(hotel._id);
        setHotelFormData({
            name: hotel.name,
            description: hotel.description,
            location: hotel.location,
            city: hotel.city,
            pricePerNight: hotel.pricePerNight,
            originalPrice: hotel.originalPrice || '',
            tag: hotel.tag || 'Verified Stay',
            images: hotel.images ? hotel.images.join(', ') : '',
            amenities: hotel.amenities ? hotel.amenities.join(', ') : '',
            availableRooms: hotel.availableRooms || 5,
        });
        setShowHotelModal(true);
    };

    const handleHotelFormSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setStatusMsg({ type: '', text: '' });

        const payload = {
            ...hotelFormData,
            images: hotelFormData.images
                ? hotelFormData.images.split(',').map((img) => img.trim()).filter(Boolean)
                : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
            amenities: hotelFormData.amenities
                ? hotelFormData.amenities.split(',').map((a) => a.trim()).filter(Boolean)
                : ['Free WiFi', 'AC', 'Breakfast Included'],
        };

        try {
            if (isEditingHotel) {
                const res = await updateHotelListing(currentHotelId, payload);
                setStatusMsg({ type: 'success', text: res.data.message || 'Property updated successfully!' });
            } else {
                const res = await createHotelListing(payload);
                setStatusMsg({ type: 'success', text: res.data.message || 'New property added successfully!' });
            }
            setShowHotelModal(false);
            loadData();
        } catch (err) {
            setStatusMsg({
                type: 'danger',
                text: err.response?.data?.message || 'Failed to save property listing.'
            });
        } finally {
            setActionLoading(false);
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
        }
    };

    const handleDeleteHotel = async (hotelId, hotelName) => {
        if (!window.confirm(`Are you sure you want to delete "${hotelName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await deleteHotelListing(hotelId);
            setStatusMsg({ type: 'success', text: res.data.message || 'Property deleted successfully.' });
            loadData();
        } catch (err) {
            setStatusMsg({
                type: 'danger',
                text: err.response?.data?.message || 'Failed to delete property.'
            });
        } finally {
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
        }
    };

    // ==========================================
    // USER HANDLERS (BLOCK, EDIT, DELETE)
    // ==========================================
    const handleToggleBlock = async (userId) => {
        try {
            const res = await toggleBlockUser(userId);
            setStatusMsg({ type: 'success', text: res.data.message });
            loadData();
        } catch (err) {
            setStatusMsg({ type: 'danger', text: err.response?.data?.message || 'Action failed.' });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user and all associated reservations?')) {
            return;
        }
        try {
            const res = await deleteUserAccount(userId);
            setStatusMsg({ type: 'success', text: res.data.message });
            loadData();
        } catch (err) {
            setStatusMsg({ type: 'danger', text: err.response?.data?.message || 'Delete failed.' });
        }
    };

    const handleOpenUserEdit = (targetUser) => {
        setCurrentUser(targetUser);
        setUserFormData({
            username: targetUser.username,
            email: targetUser.email,
            phone: targetUser.phone,
            role: targetUser.role,
            isVerified: targetUser.isVerified,
        });
        setShowUserModal(true);
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUserDetails(currentUser._id, userFormData);
            setStatusMsg({ type: 'success', text: 'User details updated successfully.' });
            setShowUserModal(false);
            loadData();
        } catch (err) {
            setStatusMsg({ type: 'danger', text: err.response?.data?.message || 'Update failed.' });
        }
    };

    // Filtered bookings
    const filteredBookings = bookings.filter((b) => {
        const term = bookingSearch.toLowerCase();
        return (
            b.user?.username?.toLowerCase().includes(term) ||
            b.user?.email?.toLowerCase().includes(term) ||
            b.hotel?.name?.toLowerCase().includes(term) ||
            b.checkoutCode?.toLowerCase().includes(term) ||
            b._id?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="container-fluid px-lg-5 py-3 py-md-4 min-vh-100 position-relative text-white" style={{ zIndex: 1 }}>

            {/* Top Header Console Bar */}
            <header className="cyber-card p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                    <img
                        src={aashrayLogo}
                        alt="Logo"
                        style={{ width: '42px', height: '42px', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.45))' }}
                    />
                    <div>
                        <h4 className="mb-0 fw-bold text-white tracking-wide">AASHRAY COMMAND CONSOLE</h4>
                        <span className="small text-subtext">Unified Master Platform, Stay & Reservation Audit Ledger</span>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <Link to="/dashboard" className="btn btn-action btn-sm">
                        <i className="fa-solid fa-arrow-left me-1"></i> Guest View
                    </Link>
                    <button onClick={handleOpenAddHotel} className="btn btn-lightning btn-sm d-flex align-items-center gap-2">
                        <i className="fa-solid fa-plus"></i>
                        <span>Add Property</span>
                    </button>
                </div>
            </header>

            {/* Global Status Notification */}
            {statusMsg.text && (
                <div className={`alert alert-${statusMsg.type} alert-dismissible fade show cyber-card text-white mb-4`} role="alert">
                    <i className={`fa-solid ${statusMsg.type === 'success' ? 'fa-circle-check text-success' : 'fa-triangle-exclamation text-danger'} me-2`}></i>
                    {statusMsg.text}
                    <button type="button" className="btn-close btn-close-white" onClick={() => setStatusMsg({ type: '', text: '' })}></button>
                </div>
            )}

            {/* Analytics KPI Row */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="cyber-card p-3">
                        <span className="text-subtext small">Total Registered Users</span>
                        <h3 className="fw-bold text-white mb-0 mt-1">{users.length}</h3>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="cyber-card p-3">
                        <span className="text-subtext small">Active Properties</span>
                        <h3 className="fw-bold text-cyan-glow mb-0 mt-1">{stats.totalHotels}</h3>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="cyber-card p-3">
                        <span className="text-subtext small">Total Bookings Recorded</span>
                        <h3 className="fw-bold text-white mb-0 mt-1">{bookings.length}</h3>
                    </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="cyber-card p-3">
                        <span className="text-subtext small">Gross Platform Revenue</span>
                        <h3 className="fw-bold text-success mb-0 mt-1">₹{stats.totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* OWNER / ADMIN INSTANT CHECKOUT VERIFICATION PORTAL */}
            <div className="cyber-card p-4 mb-4 border border-info border-opacity-50">
                <div className="row align-items-center g-3">
                    <div className="col-12 col-lg-7">
                        <h5 className="fw-bold text-white mb-1">
                            <i className="fa-solid fa-qrcode text-cyan-glow me-2"></i>Owner Departure Checkout Portal
                        </h5>
                        <p className="text-subtext small mb-0">
                            Enter the guest's 6-digit checkout pass code to confirm departure and permanently lock the booking history.
                        </p>
                    </div>
                    <div className="col-12 col-lg-5">
                        <form onSubmit={handleOwnerCheckoutVerify} className="d-flex gap-2">
                            <input
                                type="text"
                                required
                                placeholder="e.g. ASH-7492"
                                className="form-control cyber-input text-center fw-bold font-monospace text-uppercase"
                                value={inputCheckoutCode}
                                onChange={(e) => setInputCheckoutCode(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={verifyingCheckout || !inputCheckoutCode.trim()}
                                className="btn btn-lightning px-3 fw-bold text-nowrap d-flex align-items-center gap-1"
                            >
                                {verifyingCheckout ? (
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                ) : (
                                    <i className="fa-solid fa-check-double"></i>
                                )}
                                <span>Verify Checkout</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* 3-Tab Master Navigation */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                <button
                    className={`btn ${activeTab === 'bookings' ? 'btn-lightning' : 'btn-action'} py-2 px-3 px-md-4 fw-semibold`}
                    onClick={() => setActiveTab('bookings')}
                >
                    <i className="fa-solid fa-receipt me-2"></i> All Reservations & Ledger ({bookings.length})
                </button>
                <button
                    className={`btn ${activeTab === 'hotels' ? 'btn-lightning' : 'btn-action'} py-2 px-3 px-md-4 fw-semibold`}
                    onClick={() => setActiveTab('hotels')}
                >
                    <i className="fa-solid fa-hotel me-2"></i> Manage Stays ({hotels.length})
                </button>
                <button
                    className={`btn ${activeTab === 'users' ? 'btn-lightning' : 'btn-action'} py-2 px-3 px-md-4 fw-semibold`}
                    onClick={() => setActiveTab('users')}
                >
                    <i className="fa-solid fa-users-gear me-2"></i> User Access Control ({users.length})
                </button>
            </div>

            {/* ======================================================= */}
            {/* TAB 1: MASTER RESERVATIONS & AUDIT LEDGER               */}
            {/* ======================================================= */}
            {activeTab === 'bookings' && (
                <div className="cyber-card p-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                        <div>
                            <h5 className="fw-bold text-white mb-0">
                                <i className="fa-solid fa-file-invoice-dollar me-2 text-cyan-glow"></i>Complete Booking & Owner-Guest Audit Ledger
                            </h5>
                            <span className="text-subtext small">Comprehensive view of traveler identity, booked villa, assigned owner, duration, and settlement.</span>
                        </div>
                        <div style={{ maxWidth: '320px', width: '100%' }}>
                            <div className="position-relative">
                                <input
                                    type="text"
                                    className="form-control cyber-input py-1 ps-4"
                                    placeholder="Search guest, villa, code..."
                                    style={{ fontSize: '13px' }}
                                    value={bookingSearch}
                                    onChange={(e) => setBookingSearch(e.target.value)}
                                />
                                <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-2 text-subtext" style={{ fontSize: '11px' }}></i>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-5 text-subtext">
                            <i className="fa-solid fa-spinner fa-spin fs-3 mb-2 text-info"></i>
                            <p>Loading master booking records...</p>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="text-center py-5 text-subtext">
                            <i className="fa-solid fa-folder-open fs-2 mb-2 text-secondary"></i>
                            <p>No reservations matched the search filter.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                                <thead>
                                    <tr className="text-subtext border-secondary" style={{ fontSize: '12px' }}>
                                        <th>Pass Code / ID</th>
                                        <th>Guest (Booked By)</th>
                                        <th>Sanctuary / Villa</th>
                                        <th>Property Owner</th>
                                        <th>Stay Duration</th>
                                        <th>Guests</th>
                                        <th>Total Paid</th>
                                        <th className="text-end">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map((b) => {
                                        const ownerInfo = b.hotel?.owner || {
                                            username: 'Aashray Central',
                                            email: 'support@aashraystays.com',
                                            phone: '+91 98765 43210'
                                        };

                                        return (
                                            <tr key={b._id} className="border-secondary border-opacity-25" style={{ fontSize: '13px' }}>
                                                {/* Pass Code */}
                                                <td>
                                                    <span className="badge bg-dark border border-info border-opacity-50 text-cyan-glow font-monospace px-2 py-1">
                                                        {b.checkoutCode || 'ASH-7701'}
                                                    </span>
                                                    <div className="text-muted font-monospace mt-1" style={{ fontSize: '10px' }}>
                                                        {b._id.slice(-6)}
                                                    </div>
                                                </td>

                                                {/* Guest User Details */}
                                                <td>
                                                    <div className="fw-bold text-white">{b.user?.username || 'Verified Traveler'}</div>
                                                    <div className="text-subtext" style={{ fontSize: '11px' }}>{b.user?.email || 'N/A'}</div>
                                                    <small className="text-detail" style={{ fontSize: '11px' }}>
                                                        <i className="fa-solid fa-phone me-1 text-info"></i>{b.user?.phone || 'No phone'}
                                                    </small>
                                                </td>

                                                {/* Villa / Hotel Details */}
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <img
                                                            src={b.hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=120&q=80'}
                                                            alt={b.hotel?.name}
                                                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
                                                        />
                                                        <div>
                                                            <div className="fw-bold text-white">{b.hotel?.name || 'Sanctuary Stay'}</div>
                                                            <small className="text-subtext">{b.hotel?.location || 'Verified Stays'}</small>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Owner Details */}
                                                <td>
                                                    <div className="fw-bold text-warning">{ownerInfo.username}</div>
                                                    <div className="text-subtext" style={{ fontSize: '11px' }}>{ownerInfo.email}</div>
                                                    <small className="text-muted" style={{ fontSize: '11px' }}>{ownerInfo.phone || 'Platform Custodian'}</small>
                                                </td>

                                                {/* Stay Duration */}
                                                <td>
                                                    <div className="text-white">
                                                        {new Date(b.checkInDate).toLocaleDateString()} &rarr; {new Date(b.checkOutDate).toLocaleDateString()}
                                                    </div>
                                                    <small className="text-cyan-glow fw-semibold">
                                                        {b.totalNights || 1} Night(s) Duration
                                                    </small>
                                                </td>

                                                {/* Guests */}
                                                <td>
                                                    <span className="badge bg-dark border border-secondary border-opacity-50 text-detail">
                                                        {b.guestsCount || b.guests || 1} Guest(s)
                                                    </span>
                                                </td>

                                                {/* Total Price */}
                                                <td>
                                                    <span className="fw-bold text-success fs-6">₹{b.totalPrice?.toLocaleString()}</span>
                                                </td>

                                                {/* Status */}
                                                <td className="text-end">
                                                    <span className={`badge ${b.status === 'Checked-Out'
                                                        ? 'bg-secondary text-white'
                                                        : b.status === 'Cancelled'
                                                            ? 'bg-danger'
                                                            : 'bg-success bg-opacity-25 text-success border border-success border-opacity-50'
                                                        } px-2 py-1`}>
                                                        {b.status === 'Checked-Out' && <i className="fa-solid fa-lock me-1"></i>}
                                                        {b.status === 'Confirmed' && <i className="fa-solid fa-circle-check me-1"></i>}
                                                        {b.status === 'Cancelled' && <i className="fa-solid fa-ban me-1"></i>}
                                                        {b.status}
                                                    </span>
                                                    {b.checkedOutAt && (
                                                        <div className="text-muted mt-1" style={{ fontSize: '10px' }}>
                                                            {new Date(b.checkedOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ======================================================= */}
            {/* TAB 2: PROPERTIES CATALOG (ADD, EDIT, DELETE)           */}
            {/* ======================================================= */}
            {activeTab === 'hotels' && (
                <div className="cyber-card p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold text-white mb-0">
                            <i className="fa-solid fa-hotel me-2 text-info"></i>Managed Stays & Sanctuaries
                        </h5>
                    </div>

                    {loading ? (
                        <div className="text-center py-5 text-subtext">
                            <i className="fa-solid fa-spinner fa-spin fs-3 mb-2 text-info"></i>
                            <p>Loading stays catalog...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                                <thead>
                                    <tr className="text-subtext border-secondary">
                                        <th>Hotel</th>
                                        <th>City</th>
                                        <th>Price / Night</th>
                                        <th>Rating</th>
                                        <th>Rooms</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hotels.map((h) => (
                                        <tr key={h._id} className="border-secondary border-opacity-25">
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <img
                                                        src={h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80'}
                                                        alt={h.name}
                                                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }}
                                                    />
                                                    <div>
                                                        <div className="fw-bold text-white">{h.name}</div>
                                                        <small className="text-subtext">{h.location}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-capitalize">{h.city}</td>
                                            <td className="fw-bold text-cyan-glow">₹{h.pricePerNight}</td>
                                            <td>
                                                <span className="text-warning">
                                                    <i className="fa-solid fa-star me-1"></i>{h.rating}
                                                </span>
                                            </td>
                                            <td>{h.availableRooms || 5} Units</td>
                                            <td className="text-end">
                                                <button
                                                    onClick={() => handleOpenEditHotel(h)}
                                                    className="btn btn-sm btn-outline-info me-2"
                                                    title="Edit Property"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteHotel(h._id, h.name)}
                                                    className="btn btn-sm btn-outline-danger"
                                                    title="Delete Property"
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ======================================================= */}
            {/* TAB 3: USER ACCESS CONTROL                              */}
            {/* ======================================================= */}
            {activeTab === 'users' && (
                <div className="cyber-card p-4">
                    <h5 className="fw-bold text-white mb-3">
                        <i className="fa-solid fa-user-shield me-2 text-cyan-glow"></i>Identity & Access Registry
                    </h5>

                    <div className="table-responsive">
                        <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
                            <thead>
                                <tr className="text-subtext border-secondary">
                                    <th>User</th>
                                    <th>Contact Info</th>
                                    <th>System Role</th>
                                    <th>Status</th>
                                    <th>Verification</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} className="border-secondary border-opacity-25">
                                        <td>
                                            <div className="fw-bold text-white">{u.username}</div>
                                            <small className="text-subtext font-monospace" style={{ fontSize: '11px' }}>{u._id}</small>
                                        </td>
                                        <td>
                                            <div className="text-detail small">{u.email}</div>
                                            <small className="text-subtext">{u.phone}</small>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.role === 'Admin' ? 'bg-danger' : u.role === 'Owner' ? 'bg-warning text-dark' : 'bg-info text-dark'} px-2 py-1`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.isBlocked ? 'bg-danger' : 'bg-success'} px-2 py-1`}>
                                                {u.isBlocked ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            {u.isVerified ? (
                                                <span className="text-success small fw-semibold"><i className="fa-solid fa-circle-check me-1"></i>Verified</span>
                                            ) : (
                                                <span className="text-warning small"><i className="fa-solid fa-clock me-1"></i>Pending</span>
                                            )}
                                        </td>
                                        <td className="text-end">
                                            <button onClick={() => handleOpenUserEdit(u)} className="btn btn-sm btn-outline-info me-2" title="Edit Profile/Role">
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button
                                                onClick={() => handleToggleBlock(u._id)}
                                                className={`btn btn-sm ${u.isBlocked ? 'btn-outline-success' : 'btn-outline-warning'} me-2`}
                                                title={u.isBlocked ? 'Unblock User' : 'Suspend User'}
                                            >
                                                <i className={`fa-solid ${u.isBlocked ? 'fa-lock-open' : 'fa-ban'}`}></i>
                                            </button>
                                            <button onClick={() => handleDeleteUser(u._id)} className="btn btn-sm btn-outline-danger" title="Delete User">
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* HOTEL ADD / EDIT MODAL */}
            {showHotelModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 1060, backdropFilter: 'blur(8px)' }}>
                    <div className="cyber-card p-4 p-md-5" style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-white mb-0">
                                {isEditingHotel ? 'Edit Sanctuary Listing' : 'Register New Sanctuary'}
                            </h5>
                            <button onClick={() => setShowHotelModal(false)} className="btn btn-sm btn-outline-secondary rounded-circle">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleHotelFormSubmit} className="d-flex flex-column gap-3">
                            <div>
                                <label className="text-subtext small mb-1">Property Name</label>
                                <input
                                    type="text"
                                    required
                                    className="form-control cyber-input"
                                    placeholder="e.g. Aashray Coastal Bliss Villa"
                                    value={hotelFormData.name}
                                    onChange={(e) => setHotelFormData({ ...hotelFormData, name: e.target.value })}
                                />
                            </div>

                            <div className="row g-2">
                                <div className="col-8">
                                    <label className="text-subtext small mb-1">Full Location Address</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-control cyber-input"
                                        placeholder="e.g. Candolim Beach, Goa"
                                        value={hotelFormData.location}
                                        onChange={(e) => setHotelFormData({ ...hotelFormData, location: e.target.value })}
                                    />
                                </div>
                                <div className="col-4">
                                    <label className="text-subtext small mb-1">City Code</label>
                                    <input
                                        type="text"
                                        required
                                        className="form-control cyber-input"
                                        placeholder="e.g. goa"
                                        value={hotelFormData.city}
                                        onChange={(e) => setHotelFormData({ ...hotelFormData, city: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-subtext small mb-1">Description</label>
                                <textarea
                                    rows="2"
                                    required
                                    className="form-control cyber-input"
                                    placeholder="Provide an enticing summary for travelers..."
                                    value={hotelFormData.description}
                                    onChange={(e) => setHotelFormData({ ...hotelFormData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="text-subtext small mb-1">Price / Night (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="form-control cyber-input"
                                        placeholder="4999"
                                        value={hotelFormData.pricePerNight}
                                        onChange={(e) => setHotelFormData({ ...hotelFormData, pricePerNight: e.target.value })}
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="text-subtext small mb-1">Original Price (₹)</label>
                                    <input
                                        type="number"
                                        className="form-control cyber-input"
                                        placeholder="7500"
                                        value={hotelFormData.originalPrice}
                                        onChange={(e) => setHotelFormData({ ...hotelFormData, originalPrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="text-subtext small mb-1">Available Rooms</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control cyber-input"
                                        value={hotelFormData.availableRooms}
                                        onChange={(e) => setHotelFormData({ ...hotelFormData, availableRooms: e.target.value })}
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="text-subtext small mb-1">Display Badge Tag</label>
                                    <input
                                        type="text"
                                        className="form-control cyber-input"
                                        placeholder="Luxury Stay"
                                        value={hotelFormData.tag}
                                        onChange={(e) => setHotelFormData({ ...hotelFormData, tag: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-subtext small mb-1">Amenities (Comma-separated)</label>
                                <input
                                    type="text"
                                    className="form-control cyber-input"
                                    placeholder="Free WiFi, Sea View, Pool, Breakfast Included"
                                    value={hotelFormData.amenities}
                                    onChange={(e) => setHotelFormData({ ...hotelFormData, amenities: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-subtext small mb-1">Image URL(s) (Comma-separated)</label>
                                <input
                                    type="text"
                                    className="form-control cyber-input"
                                    placeholder="https://images.unsplash.com/photo-..."
                                    value={hotelFormData.images}
                                    onChange={(e) => setHotelFormData({ ...hotelFormData, images: e.target.value })}
                                />
                            </div>

                            <button type="submit" className="btn btn-lightning py-2 mt-2 d-flex align-items-center justify-content-center gap-2" disabled={actionLoading}>
                                {actionLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-floppy-disk"></i>}
                                <span>{isEditingHotel ? 'Save Property Updates' : 'Publish Property Listing'}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* USER EDIT MODAL */}
            {showUserModal && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 1060, backdropFilter: 'blur(8px)' }}>
                    <div className="cyber-card p-4 p-md-5" style={{ maxWidth: '500px', width: '100%' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-white mb-0">Modify User Access</h5>
                            <button onClick={() => setShowUserModal(false)} className="btn btn-sm btn-outline-secondary rounded-circle">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleUserSubmit} className="d-flex flex-column gap-3">
                            <div>
                                <label className="text-subtext small mb-1">Username / Name</label>
                                <input type="text" required className="form-control cyber-input" value={userFormData.username} onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })} />
                            </div>

                            <div>
                                <label className="text-subtext small mb-1">Email Address</label>
                                <input type="email" required className="form-control cyber-input" value={userFormData.email} onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })} />
                            </div>

                            <div>
                                <label className="text-subtext small mb-1">Phone Number</label>
                                <input type="text" required className="form-control cyber-input" value={userFormData.phone} onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })} />
                            </div>

                            <div>
                                <label className="text-subtext small mb-1">Role Hierarchy</label>
                                <select className="form-select cyber-input" value={userFormData.role} onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}>
                                    <option value="User">User (Standard Guest)</option>
                                    <option value="Owner">Owner (Property Partner)</option>
                                    <option value="Admin">Admin (Full System Privilege)</option>
                                </select>
                            </div>

                            <div className="form-check form-switch mt-2">
                                <input className="form-check-input" type="checkbox" checked={userFormData.isVerified} onChange={(e) => setUserFormData({ ...userFormData, isVerified: e.target.checked })} />
                                <label className="form-check-label text-detail small ms-2">Mark Email OTP as Verified</label>
                            </div>

                            <button type="submit" className="btn btn-lightning py-2 mt-3">
                                Update Identity Record
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;