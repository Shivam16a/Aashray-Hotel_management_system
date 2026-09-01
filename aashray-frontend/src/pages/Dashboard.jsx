// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import aashrayLogo from '../assets/Aasray.svg';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Infinite Carousel Slides with Built-in Offer Badges
  const infiniteSlides = [
    {
      title: 'Coastal Goa Pool Villas',
      location: 'Candolim, Goa',
      img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80',
      tag: 'Beachfront Living',
      offer: 'FLAT 25% OFF'
    },
    {
      title: 'Mist Mountain Chalets',
      location: 'Old Manali, HP',
      img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=700&q=80',
      tag: 'Pine Forest View',
      offer: 'SAVE ₹3,000'
    },
    {
      title: 'Royal Lake Pichola Palace',
      location: 'Udaipur, Rajasthan',
      img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=700&q=80',
      tag: 'Heritage Luxury',
      offer: 'ROYAL PERK'
    },
    {
      title: 'Jaipur Haveli Suites',
      location: 'Civil Lines, Jaipur',
      img: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=700&q=80',
      tag: 'Royal Hospitality',
      offer: 'FREE DINING'
    },
    {
      title: 'Skyline Penthouse Suites',
      location: 'Connaught Place, Delhi',
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80',
      tag: 'Urban Oasis',
      offer: '20% REBATE'
    }
  ];

  return (
    <div className="container-fluid px-2 px-sm-3 px-lg-5 py-3 py-md-4 min-vh-100 position-relative text-white" style={{ zIndex: 1 }}>

      {/* ======================================================= */}
      {/* 1. FULLY RESPONSIVE TOP NAVBAR                          */}
      {/* ======================================================= */}
      <header className="cyber-card p-3 mb-4">
        <div className="d-flex align-items-center justify-content-between">

          {/* Logo & Brand Identity */}
          <div className="d-flex align-items-center gap-2 gap-sm-3 cursor-pointer" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            <img
              src={aashrayLogo}
              alt="Aashray Logo"
              style={{ width: '38px', height: '38px', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.45))' }}
            />
            <div>
              <h5 className="mb-0 fw-bold text-white tracking-wide fs-6 fs-sm-5" style={{ letterSpacing: '1px' }}>AASHRAY STAYS</h5>
              <span className="small text-subtext d-none d-sm-inline" style={{ fontSize: '11px' }}>Premium Stays & Sanctuary Booking</span>
            </div>
          </div>

          {/* Desktop & Tablet Nav Actions (Visible on lg & up) */}
          <div className="d-none d-lg-flex align-items-center gap-2 gap-xl-3">
            {/* <button
              onClick={() => navigate('/dashboard/property')}
              className="btn btn-lightning btn-sm px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow"
            >
              <i className="fa-solid fa-compass"></i>
              <span>Explore Stays</span>
            </button> */}

            {(user?.role === 'Admin' || user?.role === 'Owner') && (
              <button
                onClick={() => navigate('/admin')}
                className="btn btn-action btn-sm px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow"
              >
                <i className="fa-solid fa-gauge-high text-cyan-glow"></i>
                <span>Admin Console</span>
              </button>
            )}

            <button
              onClick={() => navigate('/about')}
              className="btn btn-action btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2"
            >
              <i className="fa-solid fa-circle-info"></i>
              <span>About</span>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="btn btn-action btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2"
              title="Manage Account Profile"
            >
              <i className="fa-regular fa-user"></i>
              <span>Profile</span>
            </button>

            {/* User Identity Pill */}
            <div className="text-end ps-2 border-start border-secondary border-opacity-50">
              <div className="fw-semibold text-white small text-truncate" style={{ maxWidth: '120px' }}>{user?.username || 'Guest'}</div>
              <span
                className={`badge ${user?.role === 'Admin' ? 'bg-danger' : user?.role === 'Owner' ? 'bg-warning text-dark' : 'bg-info text-dark'} rounded-pill fw-bold`}
                style={{ fontSize: '10px' }}
              >
                {user?.role || 'User'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline-danger btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-1"
              title="Logout Session"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile & Tablet Toggle Button (Visible below lg) */}
          <div className="d-flex d-lg-none align-items-center gap-2">
            <span
              className={`badge ${user?.role === 'Admin' ? 'bg-danger' : user?.role === 'Owner' ? 'bg-warning text-dark' : 'bg-info text-dark'} rounded-pill fw-bold d-sm-inline`}
              style={{ fontSize: '10px' }}
            >
              {user?.role || 'Guest'}
            </span>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-action btn-sm px-2 py-1 fs-5"
              aria-label="Toggle navigation menu"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="d-lg-none mt-3 pt-3 border-top border-secondary border-opacity-25 d-flex flex-column gap-2 animate-fadeIn">
            <div className="d-flex justify-content-between align-items-center px-2 py-1 mb-1 bg-dark rounded-2 border border-secondary border-opacity-25">
              <span className="small text-subtext">Signed in as:</span>
              <strong className="text-cyan-glow small">{user?.username || 'Guest'}</strong>
            </div>

            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/dashboard/property'); }}
              className="btn btn-lightning w-100 py-2 fw-bold text-start d-flex align-items-center gap-2"
            >
              <i className="fa-solid fa-compass"></i>
              <span>Explore All Stays & Villas</span>
            </button>

            {(user?.role === 'Admin' || user?.role === 'Owner') && (
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/admin'); }}
                className="btn btn-action w-100 py-2 fw-semibold text-start d-flex align-items-center gap-2"
              >
                <i className="fa-solid fa-gauge-high text-cyan-glow"></i>
                <span>Admin Console</span>
              </button>
            )}

            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/about'); }}
              className="btn btn-action w-100 py-2 fw-semibold text-start d-flex align-items-center gap-2"
            >
              <i className="fa-solid fa-circle-info"></i>
              <span>About Platform</span>
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }}
              className="btn btn-action w-100 py-2 fw-semibold text-start d-flex align-items-center gap-2"
            >
              <i className="fa-regular fa-user"></i>
              <span>Account Profile</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn btn-outline-danger w-100 py-2 fw-semibold text-start d-flex align-items-center gap-2 mt-1"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              <span>Logout Account</span>
            </button>
          </div>
        )}
      </header>

      {/* ======================================================= */}
      {/* 2. HERO SECTION                                         */}
      {/* ======================================================= */}
      <section className="cyber-card p-4 p-md-5 mb-4 mb-md-5 text-center position-relative overflow-hidden">
        <span className="badge bg-primary bg-opacity-25 border border-info border-opacity-50 text-cyan-glow px-3 py-2 rounded-pill small mb-3">
          <i className="fa-solid fa-sparkles me-2"></i>Curated Safe & Luxury Retreats
        </span>
        <h1 className="fw-bold text-white display-6 display-md-5 mb-3">
          Find Your Perfect Sanctuary with <span className="text-cyan-glow">Aashray</span>
        </h1>
        <p className="text-subtext fs-6 mx-auto mb-4" style={{ maxWidth: '680px' }}>
          Discover handpicked luxury villas, coastal retreats, and heritage palaces verified for cryptographic trust and ultimate comfort.
        </p>

        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            onClick={() => navigate('/dashboard/property')}
            className="btn btn-lightning btn-lg px-4 px-md-5 py-3 fw-bold d-flex align-items-center gap-2 gap-md-3 shadow-lg fs-6"
          >
            <i className="fa-solid fa-compass fs-5"></i>
            <span>Explore All Sanctuaries</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 3. INFINITE AUTO-SCROLLING SLIDE BANNER (WITH OFFERS)   */}
      {/* ======================================================= */}
      <section className="mb-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h4 className="fw-bold text-white mb-0 fs-5 fs-md-4">
              <i className="fa-solid fa-fire text-warning me-2"></i>Trending Luxury Destinations
            </h4>
            <span className="text-subtext small">Continuous live showcase with exclusive stay perks</span>
          </div>
          <button
            onClick={() => navigate('/dashboard/property')}
            className="btn btn-action btn-sm"
          >
            View All <i className="fa-solid fa-arrow-right ms-1"></i>
          </button>
        </div>

        <div className="infinite-marquee-container py-2">
          {/* Loop track 1 */}
          <div className="infinite-marquee-track">
            {infiniteSlides.map((slide, idx) => (
              <div
                key={idx}
                className="cyber-card p-0 overflow-hidden cursor-pointer position-relative shrink-0"
                style={{ width: '300px', height: '200px', cursor: 'pointer' }}
                onClick={() => navigate('/dashboard/property')}
              >
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="w-100 h-100 object-fit-cover transition-all"
                  style={{ filter: 'brightness(0.85)' }}
                />

                {/* Badges on Slide */}
                <div className="position-absolute top-0 start-0 m-3 d-flex gap-2">
                  <span className="badge bg-dark bg-opacity-80 text-cyan-glow border border-info border-opacity-50 small">
                    {slide.tag}
                  </span>
                  {slide.offer && (
                    <span className="badge bg-warning bg-opacity-90 text-dark fw-bold small">
                      {slide.offer}
                    </span>
                  )}
                </div>

                <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)' }}>
                  <h6 className="fw-bold text-white mb-0">{slide.title}</h6>
                  <small className="text-info"><i className="fa-solid fa-location-dot me-1"></i>{slide.location}</small>
                </div>
              </div>
            ))}
          </div>

          {/* Loop track 2 (Duplicate for seamless loop) */}
          <div className="infinite-marquee-track" aria-hidden="true">
            {infiniteSlides.map((slide, idx) => (
              <div
                key={`dup-${idx}`}
                className="cyber-card p-0 overflow-hidden cursor-pointer position-relative shrink-0"
                style={{ width: '300px', height: '200px', cursor: 'pointer' }}
                onClick={() => navigate('/dashboard/property')}
              >
                <img
                  src={slide.img}
                  alt={slide.title}
                  className="w-100 h-100 object-fit-cover transition-all"
                  style={{ filter: 'brightness(0.85)' }}
                />

                {/* Badges on Slide */}
                <div className="position-absolute top-0 start-0 m-3 d-flex gap-2">
                  <span className="badge bg-dark bg-opacity-80 text-cyan-glow border border-info border-opacity-50 small">
                    {slide.tag}
                  </span>
                  {slide.offer && (
                    <span className="badge bg-warning bg-opacity-90 text-dark fw-bold small">
                      {slide.offer}
                    </span>
                  )}
                </div>

                <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)' }}>
                  <h6 className="fw-bold text-white mb-0">{slide.title}</h6>
                  <small className="text-info"><i className="fa-solid fa-location-dot me-1"></i>{slide.location}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 4. WHY CHOOSE AASHRAY (IMAGE + STORY)                   */}
      {/* ======================================================= */}
      <section className="mb-5">
        <div className="text-center mb-5">
          <span className="badge bg-info bg-opacity-25 text-cyan-glow border border-info border-opacity-50 px-3 py-2 rounded-pill small mb-2">
            <i className="fa-solid fa-crown me-2"></i>The Aashray Advantage
          </span>
          <h2 className="fw-bold text-white fs-3 fs-md-2">Why Aashray Stands Apart</h2>
          <p className="text-subtext small mx-auto" style={{ maxWidth: '600px' }}>
            We redesigned the travel experience from ground up to eliminate bait-and-switch listings, check-in delays, and hidden checkout surcharges.
          </p>
        </div>

        {/* Feature 1 */}
        <div className="row g-4 align-items-center mb-5">
          <div className="col-12 col-lg-6">
            <div className="position-relative rounded-4 overflow-hidden border border-secondary border-opacity-50 shadow-lg" style={{ height: '300px' }}>
              <img
                src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80"
                alt="Physical Auditing"
                className="w-100 h-100 object-fit-cover"
              />
              <span className="badge bg-dark bg-opacity-80 text-cyan-glow position-absolute bottom-0 start-0 m-3 px-3 py-2 border border-info border-opacity-50 rounded-pill">
                <i className="fa-solid fa-shield-check me-2"></i>100% Verified Real Stays
              </span>
            </div>
          </div>
          <div className="col-12 col-lg-6 ps-lg-4">
            <span className="text-cyan-glow fw-bold small text-uppercase tracking-wider">Zero Fake Photos</span>
            <h3 className="fw-bold text-white mt-1 mb-3 fs-4 fs-md-3">24-Point Physical & Comfort Audit</h3>
            <p className="text-subtext lead fs-6 mb-3">
              Unlike generic aggregators that list unverified properties, every sanctuary on Aashray is personally inspected. What you see in high-definition photos is exactly what greets you at the door.
            </p>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2 text-detail small">
                <i className="fa-solid fa-circle-check text-info"></i>
                <span>Strict acoustic and privacy checks for workations and retreats.</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-detail small">
                <i className="fa-solid fa-circle-check text-info"></i>
                <span>Guaranteed high-speed fiber internet in every suite.</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-detail small">
                <i className="fa-solid fa-circle-check text-info"></i>
                <span>Sanitized linen & premium eco-conscious toiletries.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="row g-4 align-items-center mb-5 flex-lg-row-reverse">
          <div className="col-12 col-lg-6">
            <div className="position-relative rounded-4 overflow-hidden border border-secondary border-opacity-50 shadow-lg" style={{ height: '300px' }}>
              <img
                src="https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=900&q=80"
                alt="Digital Check-in"
                className="w-100 h-100 object-fit-cover"
              />
              <span className="badge bg-dark bg-opacity-80 text-warning position-absolute bottom-0 start-0 m-3 px-3 py-2 border border-warning border-opacity-50 rounded-pill">
                <i className="fa-solid fa-bolt me-2"></i>Instant Contactless Entry
              </span>
            </div>
          </div>
          <div className="col-12 col-lg-6 pe-lg-4">
            <span className="text-warning fw-bold small text-uppercase tracking-wider">Frictionless Check-in</span>
            <h3 className="fw-bold text-white mt-1 mb-3 fs-4 fs-md-3">Cryptographic Check-In & Zero Front-Desk Queues</h3>
            <p className="text-subtext lead fs-6 mb-3">
              Skip lengthy lobby lines and paperwork. Your confirmed booking generates a secure digital pass stored directly in your portal profile and email.
            </p>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2 text-detail small">
                <i className="fa-solid fa-circle-check text-warning"></i>
                <span>Instant confirmation ID mapped directly to property management systems.</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-detail small">
                <i className="fa-solid fa-circle-check text-warning"></i>
                <span>One-tap check-in voucher ready right from your smartphone.</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-detail small">
                <i className="fa-solid fa-circle-check text-warning"></i>
                <span>Secure automated OTP verification on account recovery.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-6">
            <div className="position-relative rounded-4 overflow-hidden border border-secondary border-opacity-50 shadow-lg" style={{ height: '300px' }}>
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80"
                alt="Transparent Pricing"
                className="w-100 h-100 object-fit-cover"
              />
              <span className="badge bg-dark bg-opacity-80 text-success position-absolute bottom-0 start-0 m-3 px-3 py-2 border border-success border-opacity-50 rounded-pill">
                <i className="fa-solid fa-tag me-2"></i>No Hidden Surcharges
              </span>
            </div>
          </div>
          <div className="col-12 col-lg-6 ps-lg-4">
            <span className="text-success fw-bold small text-uppercase tracking-wider">All-Inclusive Rates</span>
            <h3 className="fw-bold text-white mt-1 mb-3 fs-4 fs-md-3">Transparent Tariffs & Guaranteed Best Rates</h3>
            <p className="text-subtext lead fs-6 mb-3">
              No surprise checkout resort fees or last-second hidden tax increments. What you see on the listing grid is the exact rate locked in for your stay.
            </p>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2 text-detail small">
                <i className="fa-solid fa-circle-check text-success"></i>
                <span>Free cancellation options up to 24 hours before check-in.</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-detail small">
                <i className="fa-solid fa-circle-check text-success"></i>
                <span>Direct partner pricing without middleman markups.</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-detail small">
                <i className="fa-solid fa-circle-check text-success"></i>
                <span>Complimentary breakfast and wellness perks bundled upfront.</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ======================================================= */}
      {/* 5. FOOTER                                               */}
      {/* ======================================================= */}
      <footer className="text-center py-4 border-top border-secondary border-opacity-25 text-subtext small">
        <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
          <img src={aashrayLogo} alt="Logo" style={{ width: '22px', height: '22px' }} />
          <span className="fw-bold text-white">AASHRAY Hospitality Network</span>
        </div>
        <div>&copy; 2026 Aashray Platforms Inc. Real-time Hotel Booking Live.</div>
        <div className="mt-2">
          <span
            className="cursor-pointer text-cyan-glow hover-underline"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/about')}
          >
            About Platform & Guide
          </span>
        </div>
      </footer>

    </div>
  );
};

export default Dashboard;