// src/pages/About.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAdminContacts, broadcastInquiryToAdmins } from '../services/api';
import aashrayLogo from '../assets/Aasray.svg';

const About = () => {
    // Dynamic Admins List State
    const [adminsList, setAdminsList] = useState([]);
    const [loadingAdmins, setLoadingAdmins] = useState(true);

    // Contact Form State
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [sendingBroadcast, setSendingBroadcast] = useState(false);
    const [broadcastStatus, setBroadcastStatus] = useState({ type: '', text: '' });

    // FAQ Accordion State
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Load All Active Admins from Database
    useEffect(() => {
        const loadAdmins = async () => {
            try {
                const res = await fetchAdminContacts();
                if (res.data.success) {
                    setAdminsList(res.data.admins);
                }
            } catch (err) {
                console.error('Failed to load admin contacts', err);
            } finally {
                setLoadingAdmins(false);
            }
        };
        loadAdmins();
    }, []);

    // 1-Click Broadcast to ALL Admins + WhatsApp Redirection
    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setSendingBroadcast(true);
        setBroadcastStatus({ type: '', text: '' });

        try {
            // 1. Dispatch Email to ALL Admins in Backend
            const res = await broadcastInquiryToAdmins(contactForm);

            if (res.data.success) {
                setBroadcastStatus({
                    type: 'success',
                    text: `Message broadcasted to all ${res.data.adminsCount} administrators via email!`
                });

                // 2. Open WhatsApp chat with primary admin
                const targetPhone = (res.data.primaryAdminPhone || "919876543210").replace(/\D/g, '');
                const waText = `Hello Admin Desk,%0A%0AMy Name: ${contactForm.name}%0AEmail: ${contactForm.email}%0APhone: ${contactForm.phone}%0AMessage: ${encodeURIComponent(contactForm.message)}`;
                window.open(`https://wa.me/${targetPhone}?text=${waText}`, '_blank');

                setContactForm({ name: '', email: '', phone: '', message: '' });
            }
        } catch (err) {
            setBroadcastStatus({
                type: 'danger',
                text: err.response?.data?.message || 'Failed to dispatch broadcast to admins.'
            });
        } finally {
            setSendingBroadcast(false);
            setTimeout(() => setBroadcastStatus({ type: '', text: '' }), 7000);
        }
    };

    const faqs = [
        {
            q: 'How does Aashray verify hotel listings?',
            a: 'Every property listed under the Aashray ecosystem undergoes a strict 24-point physical and digital audit, ensuring cryptographic digital key security, high cleanliness standards, and authentic photography.'
        },
        {
            q: 'What is the cancellation and refund policy?',
            a: 'Most of our verified sanctuaries offer free cancellation up to 24 hours prior to check-in. Refunds are processed instantly back to your original payment source or in-app wallet.'
        },
        {
            q: 'How do I access my hotel booking pass?',
            a: 'Once your reservation is confirmed, your digital check-in voucher and cryptographic booking ID are immediately accessible under "My Bookings" in your dashboard and sent to your registered email.'
        },
        {
            q: 'Can property owners list their boutique stays on Aashray?',
            a: 'Yes! Property owners can apply through our Partner Program. After verification and admin approval, owners receive access to a dedicated Owner Command Console to manage inventory and view revenue.'
        }
    ];

    return (
        <div className="container-fluid px-lg-5 py-3 py-md-4 min-vh-100 position-relative text-white" style={{ zIndex: 1 }}>

            {/* Top Navbar */}
            <header className="cyber-card p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                    <Link to="/dashboard" className="text-decoration-none">
                        <img
                            src={aashrayLogo}
                            alt="Aashray Logo"
                            style={{ width: '45px', height: '45px', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.45))' }}
                        />
                    </Link>
                    <div>
                        <h4 className="mb-0 fw-bold text-white tracking-wide">AASHRAY PORTAL</h4>
                        <span className="small text-subtext">About The Platform & Guest Guide</span>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <Link to="/dashboard" className="btn btn-action btn-sm px-3 py-2">
                        <i className="fa-solid fa-arrow-left me-2"></i>Back to Discover
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="cyber-card p-4 p-md-5 mb-5 text-center position-relative overflow-hidden">
                <span className="badge bg-primary bg-opacity-25 border border-info border-opacity-50 text-cyan-glow px-3 py-2 rounded-pill small mb-3">
                    <i className="fa-solid fa-shield-halved me-2"></i>Redefining Hospitality & Security
                </span>
                <h1 className="fw-bold text-white display-5 mb-3">
                    Your Trusted Haven for <span className="text-cyan-glow">Curated Luxury Stays</span>
                </h1>
                <p className="text-subtext fs-6 mx-auto mb-0" style={{ maxWidth: '750px' }}>
                    <strong>Aashray</strong> (आश्रय — Sanctuary) was built to bridge the gap between premium hospitality and modern cryptographic trust. We curate verified boutique retreats, royal palaces, coastal villas, and high-altitude sanctuaries designed for seamless living.
                </p>
            </section>

            {/* Core Platform Pillars */}
            <section className="mb-5">
                <h3 className="fw-bold text-white mb-4 text-center">
                    <i className="fa-solid fa-cubes-stacked me-2 text-cyan-glow"></i>Why Travelers Choose Aashray
                </h3>

                <div className="row g-4">
                    <div className="col-12 col-md-4">
                        <div className="cyber-card p-4 h-100 border border-secondary border-opacity-25">
                            <div className="p-3 bg-dark rounded-3 d-inline-block mb-3 border border-info border-opacity-50 text-cyan-glow fs-4">
                                <i className="fa-solid fa-fingerprint"></i>
                            </div>
                            <h5 className="fw-bold text-white mb-2">Cryptographic Booking Security</h5>
                            <p className="text-subtext small mb-0">
                                End-to-end authenticated reservations backed by secure identity tokens. No double booking, no fake vouchers, and instantaneous contactless key verification.
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-4">
                        <div className="cyber-card p-4 h-100 border border-secondary border-opacity-25">
                            <div className="p-3 bg-dark rounded-3 d-inline-block mb-3 border border-info border-opacity-50 text-cyan-glow fs-4">
                                <i className="fa-solid fa-gem"></i>
                            </div>
                            <h5 className="fw-bold text-white mb-2">Handpicked Luxury Sanctuaries</h5>
                            <p className="text-subtext small mb-0">
                                From Goa’s pristine coastal villas and Jaipur’s heritage palaces to Manali’s mist-wrapped mountain suites, every listing is hand-verified for prime comfort.
                            </p>
                        </div>
                    </div>

                    <div className="col-12 col-md-4">
                        <div className="cyber-card p-4 h-100 border border-secondary border-opacity-25">
                            <div className="p-3 bg-dark rounded-3 d-inline-block mb-3 border border-info border-opacity-50 text-cyan-glow fs-4">
                                <i className="fa-solid fa-bolt-lightning"></i>
                            </div>
                            <h5 className="fw-bold text-white mb-2">Real-Time Inventory Lock</h5>
                            <p className="text-subtext small mb-0">
                                Live synchronization prevents room overbooking. Guests receive instant booking receipts with comprehensive stay breakdowns and transparent pricing.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Facilities & Amenities Matrix */}
            <section className="cyber-card p-4 p-md-5 mb-5">
                <h3 className="fw-bold text-white mb-2">
                    <i className="fa-solid fa-bell-concierge me-2 text-info"></i>Sanctuary Facilities & Standards
                </h3>
                <p className="text-subtext small mb-4">Every property hosted on Aashray conforms to baseline luxury and safety benchmarks:</p>

                <div className="row g-3">
                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25 d-flex align-items-center gap-3">
                            <i className="fa-solid fa-wifi text-cyan-glow fs-5"></i>
                            <div>
                                <div className="fw-bold text-white small">Ultra-Fast WiFi</div>
                                <small className="text-subtext">Workation ready</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25 d-flex align-items-center gap-3">
                            <i className="fa-solid fa-water-ladder text-cyan-glow fs-5"></i>
                            <div>
                                <div className="fw-bold text-white small">Infinity Pools</div>
                                <small className="text-subtext">Private & shared</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25 d-flex align-items-center gap-3">
                            <i className="fa-solid fa-utensils text-cyan-glow fs-5"></i>
                            <div>
                                <div className="fw-bold text-white small">Gourmet Dining</div>
                                <small className="text-subtext">Chef curated menus</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25 d-flex align-items-center gap-3">
                            <i className="fa-solid fa-headset text-cyan-glow fs-5"></i>
                            <div>
                                <div className="fw-bold text-white small">24/7 Concierge</div>
                                <small className="text-subtext">Dedicated support</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25 d-flex align-items-center gap-3">
                            <i className="fa-solid fa-spa text-cyan-glow fs-5"></i>
                            <div>
                                <div className="fw-bold text-white small">Wellness & Spa</div>
                                <small className="text-subtext">Holistic therapies</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25 d-flex align-items-center gap-3">
                            <i className="fa-solid fa-square-parking text-cyan-glow fs-5"></i>
                            <div>
                                <div className="fw-bold text-white small">Valet Parking</div>
                                <small className="text-subtext">Secure & covered</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25 d-flex align-items-center gap-3">
                            <i className="fa-solid fa-snowflake text-cyan-glow fs-5"></i>
                            <div>
                                <div className="fw-bold text-white small">Climate Control</div>
                                <small className="text-subtext">Smart AC & heating</small>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-md-3">
                        <div className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25 d-flex align-items-center gap-3">
                            <i className="fa-solid fa-vault text-cyan-glow fs-5"></i>
                            <div>
                                <div className="fw-bold text-white small">Digital Locker</div>
                                <small className="text-subtext">In-room security</small>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Guest Journey & Step-by-Step Guide */}
            <section className="mb-5">
                <h3 className="fw-bold text-white mb-4 text-center">
                    <i className="fa-solid fa-compass me-2 text-cyan-glow"></i>How To Book With Aashray
                </h3>

                <div className="row g-4 text-center">
                    <div className="col-12 col-md-3">
                        <div className="cyber-card p-4 h-100">
                            <div className="badge bg-info text-dark rounded-circle p-3 fs-5 mb-3">1</div>
                            <h6 className="fw-bold text-white">Search & Discover</h6>
                            <p className="text-subtext small mb-0">Search by city or property name to explore verified luxury retreats.</p>
                        </div>
                    </div>

                    <div className="col-12 col-md-3">
                        <div className="cyber-card p-4 h-100">
                            <div className="badge bg-info text-dark rounded-circle p-3 fs-5 mb-3">2</div>
                            <h6 className="fw-bold text-white">Review & Inspect</h6>
                            <p className="text-subtext small mb-0">Inspect real photo galleries, guest reviews, amenities, and transparent pricing.</p>
                        </div>
                    </div>

                    <div className="col-12 col-md-3">
                        <div className="cyber-card p-4 h-100">
                            <div className="badge bg-info text-dark rounded-circle p-3 fs-5 mb-3">3</div>
                            <h6 className="fw-bold text-white">Reserve & Confirm</h6>
                            <p className="text-subtext small mb-0">Select your dates and guests to lock in your room with instant confirmation.</p>
                        </div>
                    </div>

                    <div className="col-12 col-md-3">
                        <div className="cyber-card p-4 h-100">
                            <div className="badge bg-info text-dark rounded-circle p-3 fs-5 mb-3">4</div>
                            <h6 className="fw-bold text-white">Check-in Seamlessly</h6>
                            <p className="text-subtext small mb-0">Present your digital pass from "My Bookings" for a frictionless arrival.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Help, Support & FAQ */}
            <section className="cyber-card p-4 p-md-5 mb-5">
                <h3 className="fw-bold text-white mb-3">
                    <i className="fa-solid fa-circle-question me-2 text-info"></i>Frequently Asked Questions & Support
                </h3>

                <div className="d-flex flex-column gap-3 mb-4">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="p-3 bg-dark rounded-3 border border-secondary border-opacity-25">
                            <div
                                className="d-flex justify-content-between align-items-center cursor-pointer"
                                style={{ cursor: 'pointer' }}
                                onClick={() => toggleFaq(idx)}
                            >
                                <h6 className="fw-bold text-white mb-0">{faq.q}</h6>
                                <i className={`fa-solid ${openFaq === idx ? 'fa-chevron-up text-info' : 'fa-chevron-down text-subtext'}`}></i>
                            </div>
                            {openFaq === idx && (
                                <p className="text-subtext small mt-3 mb-0 pt-2 border-top border-secondary border-opacity-25">
                                    {faq.a}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* ========================================== */}
            {/* DIRECT ADMIN CONTACTS & 1-CLICK BROADCAST  */}
            {/* ========================================== */}
            <section className="cyber-card p-4 p-md-5 mb-5">
                <div className="row g-4">

                    {/* Left Column: Live Admin Directory */}
                    <div className="col-12 col-lg-5">
                        <span className="badge bg-info bg-opacity-25 text-cyan-glow border border-info border-opacity-50 px-3 py-2 rounded-pill small mb-2">
                            <i className="fa-solid fa-user-shield me-2"></i>Live Admin Directory
                        </span>
                        <h3 className="fw-bold text-white mb-2">Platform Administrators</h3>
                        <p className="text-subtext small mb-4">
                            Direct channels for verified platform officers. You can chat with any administrator on WhatsApp or submit the form to broadcast to all admins at once.
                        </p>

                        {loadingAdmins ? (
                            <div className="text-center py-4 text-subtext">
                                <i className="fa-solid fa-spinner fa-spin me-2 text-info"></i>Loading Admin Contacts...
                            </div>
                        ) : adminsList.length === 0 ? (
                            <div className="p-3 bg-dark rounded-3 text-subtext small border border-secondary border-opacity-25">
                                Primary support: support@aashraystays.com
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {adminsList.map((admin) => (
                                    <div key={admin._id} className="p-3 rounded-3 bg-dark bg-opacity-80 border border-secondary border-opacity-50 d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="rounded-circle bg-info bg-opacity-25 text-cyan-glow fw-bold d-flex align-items-center justify-content-center border border-info border-opacity-50" style={{ width: '42px', height: '42px' }}>
                                                {admin.username?.charAt(0) || 'A'}
                                            </div>
                                            <div>
                                                <div className="fw-bold text-white small">
                                                    {admin.username} <span className="badge bg-danger ms-1" style={{ fontSize: '9px' }}>Admin</span>
                                                </div>
                                                <div className="text-subtext" style={{ fontSize: '11px' }}>{admin.email}</div>
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2">
                                            {admin.phone && (
                                                <a
                                                    href={`https://wa.me/${admin.phone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(admin.username)},%20I%20need%20assistance%20on%20Aashray.`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-success rounded-circle"
                                                    title={`Chat with ${admin.username} on WhatsApp`}
                                                >
                                                    <i className="fa-brands fa-whatsapp"></i>
                                                </a>
                                            )}
                                            <a
                                                href={`mailto:${admin.email}?subject=Aashray%20Portal%20Inquiry`}
                                                className="btn btn-sm btn-outline-info rounded-circle"
                                                title={`Send Email to ${admin.username}`}
                                            >
                                                <i className="fa-regular fa-envelope"></i>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="small text-white-50 mt-3">
                            <i className="fa-solid fa-shield-halved me-1 text-info"></i> End-to-end encrypted administrative communication.
                        </div>
                    </div>

                    {/* Right Column: Broadcast Inquiry Form */}
                    <div className="col-12 col-lg-7">
                        <div className="p-4 rounded-4 bg-dark bg-opacity-70 border border-secondary border-opacity-50 h-100">
                            <h5 className="fw-bold text-white mb-1">
                                <i className="fa-solid fa-bullhorn text-cyan-glow me-2"></i>1-Click Broadcast To All Admins
                            </h5>
                            <p className="text-subtext small mb-3">
                                Fill out the form below to dispatch your message simultaneously to all {adminsList.length} platform administrators.
                            </p>

                            {broadcastStatus.text && (
                                <div className={`alert alert-${broadcastStatus.type} py-2 small mb-3`}>
                                    <i className={`fa-solid ${broadcastStatus.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'} me-2`}></i>
                                    {broadcastStatus.text}
                                </div>
                            )}

                            <form onSubmit={handleContactSubmit} className="d-flex flex-column gap-3">
                                <div className="row g-2">
                                    <div className="col-12 col-md-6">
                                        <label className="text-subtext small mb-1">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="form-control cyber-input"
                                            placeholder="e.g. Aman Sharma"
                                            value={contactForm.name}
                                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="text-subtext small mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            className="form-control cyber-input"
                                            placeholder="+91 98765 43210"
                                            value={contactForm.phone}
                                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-subtext small mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="form-control cyber-input"
                                        placeholder="aman@example.com"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-subtext small mb-1">Message / Inquiry</label>
                                    <textarea
                                        rows="3"
                                        required
                                        className="form-control cyber-input"
                                        placeholder="Describe your inquiry, booking reference, or property query..."
                                        value={contactForm.message}
                                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={sendingBroadcast}
                                    className="btn btn-lightning py-2 mt-1 d-flex align-items-center justify-content-center gap-2"
                                >
                                    {sendingBroadcast ? (
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                    ) : (
                                        <i className="fa-solid fa-paper-plane"></i>
                                    )}
                                    <span>Broadcast Message to All Admins</span>
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer className="text-center py-4 border-top border-secondary border-opacity-25 text-subtext small">
                <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                    <img src={aashrayLogo} alt="Logo" style={{ width: '22px', height: '22px' }} />
                    <span className="fw-bold text-white">AASHRAY Hospitality Network</span>
                </div>
                <div>&copy; 2026 Aashray Platforms Inc. All Rights Reserved.</div>
            </footer>

        </div>
    );
};

export default About;