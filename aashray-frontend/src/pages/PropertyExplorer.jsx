// src/pages/PropertyExplorer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchAllHotels } from '../services/api';
import aashrayLogo from '../assets/Aasray.svg';
import BookingModal from '../components/BookingModal';
import MyBookingsModal from '../components/MyBookingsModal';
import PropertyMap from '../components/PropertyMap'; // 👈 Import Map Component

const PropertyExplorer = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [hotels, setHotels] = useState([]);
    const [allHotelsBackup, setAllHotelsBackup] = useState([]);
    const [loadingHotels, setLoadingHotels] = useState(true);

    // View Switcher State: 'grid' | 'map'
    const [viewMode, setViewMode] = useState('grid');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCityFilter, setActiveCityFilter] = useState('all');
    const [isExactMatch, setIsExactMatch] = useState(true);

    // Mobile menu toggle
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Modals state
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [showMyBookings, setShowMyBookings] = useState(false);
    const [alertSuccess, setAlertSuccess] = useState('');

    const loadHotels = async (search = '', city = 'all') => {
        setLoadingHotels(true);
        try {
            const res = await fetchAllHotels({ search });
            if (res.data.success) {
                const fetched = res.data.hotels || [];
                if (allHotelsBackup.length === 0 && fetched.length > 0) {
                    setAllHotelsBackup(fetched);
                }

                let filtered = fetched;
                if (city !== 'all') {
                    filtered = fetched.filter((h) => h.city?.toLowerCase() === city.toLowerCase());
                }

                if (filtered.length === 0 && search.trim() !== '') {
                    setIsExactMatch(false);
                    setHotels(allHotelsBackup.slice(0, 6));
                } else {
                    setIsExactMatch(true);
                    setHotels(filtered);
                }
            }
        } catch (err) {
            console.error('Failed to load hotels', err);
        } finally {
            setLoadingHotels(false);
        }
    };

    useEffect(() => {
        loadHotels();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadHotels(searchQuery, activeCityFilter);
    };

    const handleCityTagClick = (city) => {
        setActiveCityFilter(city);
        loadHotels(searchQuery, city);
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setActiveCityFilter('all');
        setIsExactMatch(true);
        loadHotels('', 'all');
    };

    return (
        <div className="container-fluid px-2 px-sm-3 px-lg-5 py-3 py-md-4 min-vh-100 position-relative text-white overflow-hidden" style={{ zIndex: 1 }}>

            {/* TOP NAVBAR */}
            <header className="cyber-card p-3 mb-4">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2 gap-sm-3 cursor-pointer" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                        <img src={aashrayLogo} alt="Aashray Logo" style={{ width: '36px', height: '36px', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.45))' }} />
                        <div>
                            <h5 className="mb-0 fw-bold text-white tracking-wide fs-6 fs-sm-5">AASHRAY STAYS</h5>
                            <span className="small text-subtext d-none d-sm-inline" style={{ fontSize: '11px' }}>Explore Sanctuaries</span>
                        </div>
                    </div>

                    <div className="d-none d-lg-flex align-items-center gap-2 gap-xl-3">
                        <Link to="/dashboard" className="btn btn-action btn-sm px-3 py-2 fw-semibold">
                            <i className="fa-solid fa-house me-1"></i> Dashboard
                        </Link>
                        {(user?.role === 'Admin' || user?.role === 'Owner') && (
                            <button onClick={() => navigate('/admin')} className="btn btn-lightning btn-sm px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow">
                                <i className="fa-solid fa-gauge-high"></i>
                                <span>Admin Console</span>
                            </button>
                        )}
                        <button onClick={() => setShowMyBookings(true)} className="btn btn-action btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2">
                            <i className="fa-solid fa-suitcase"></i>
                            <span>My Bookings</span>
                        </button>
                        <button onClick={() => navigate('/profile')} className="btn btn-action btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2">
                            <i className="fa-regular fa-user"></i>
                            <span>Profile</span>
                        </button>
                        <button onClick={async () => { await logout(); navigate('/login'); }} className="btn btn-outline-danger btn-sm px-3 py-2 fw-semibold">
                            <i className="fa-solid fa-right-from-bracket"></i>
                        </button>
                    </div>

                    <div className="d-flex d-lg-none align-items-center gap-2">
                        <button onClick={() => setShowMyBookings(true)} className="btn btn-action btn-sm px-2 py-1">
                            <i className="fa-solid fa-suitcase text-cyan-glow"></i>
                        </button>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="btn btn-action btn-sm px-2 py-1 fs-5">
                            <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="d-lg-none mt-3 pt-3 border-top border-secondary border-opacity-25 d-flex flex-column gap-2">
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn btn-action w-100 py-2 fw-semibold text-start d-flex align-items-center gap-2">
                            <i className="fa-solid fa-house"></i>
                            <span>Main Dashboard</span>
                        </Link>
                        {(user?.role === 'Admin' || user?.role === 'Owner') && (
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/admin'); }} className="btn btn-action w-100 py-2 fw-semibold text-start d-flex align-items-center gap-2">
                                <i className="fa-solid fa-gauge-high text-cyan-glow"></i>
                                <span>Admin Console</span>
                            </button>
                        )}
                        <button onClick={() => { setMobileMenuOpen(false); setShowMyBookings(true); }} className="btn btn-action w-100 py-2 fw-semibold text-start d-flex align-items-center gap-2">
                            <i className="fa-solid fa-suitcase"></i>
                            <span>My Reservations Ledger</span>
                        </button>
                        <button onClick={() => { setMobileMenuOpen(false); navigate('/profile'); }} className="btn btn-action w-100 py-2 fw-semibold text-start d-flex align-items-center gap-2">
                            <i className="fa-regular fa-user"></i>
                            <span>Account Profile</span>
                        </button>
                        <button onClick={async () => { await logout(); navigate('/login'); }} className="btn btn-outline-danger w-100 py-2 fw-semibold text-start d-flex align-items-center gap-2 mt-1">
                            <i className="fa-solid fa-right-from-bracket"></i>
                            <span>Logout Account</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Booking Alert */}
            {alertSuccess && (
                <div className="alert alert-success alert-dismissible fade show cyber-card text-success border-success mb-4" role="alert">
                    <i className="fa-solid fa-circle-check me-2"></i>
                    <strong>Success!</strong> {alertSuccess}
                    <button type="button" className="btn-close btn-close-white" onClick={() => setAlertSuccess('')}></button>
                </div>
            )}

            {/* SEARCH & FILTERS */}
            <section className="cyber-card p-3 p-md-4 mb-4">
                <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
                    <div className="col-12 col-md-8 col-lg-9">
                        <div className="position-relative">
                            <input
                                type="text"
                                className="form-control cyber-input py-2 ps-5 w-100"
                                placeholder="Search destination (Goa, Jaipur, Manali...)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-cyan-glow">
                                <i className="fa-solid fa-magnifying-glass"></i>
                            </span>
                        </div>
                    </div>
                    <div className="col-12 col-md-4 col-lg-3 d-flex gap-2">
                        <button type="submit" className="btn btn-lightning flex-fill py-2 d-flex align-items-center justify-content-center gap-2">
                            <i className="fa-solid fa-sliders"></i>
                            <span>Filter Stays</span>
                        </button>
                        {(searchQuery || activeCityFilter !== 'all' || !isExactMatch) && (
                            <button type="button" onClick={handleClearFilters} className="btn btn-action py-2 px-3 text-subtext" title="Reset Filters">
                                <i className="fa-solid fa-rotate-left"></i>
                            </button>
                        )}
                    </div>
                </form>

                <div className="d-flex align-items-center gap-2 mt-3 overflow-x-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
                    <span className="small text-subtext me-1"><i className="fa-solid fa-location-dot me-1 text-info"></i>Popular:</span>
                    {['all', 'goa', 'manali', 'jaipur', 'udaipur', 'delhi'].map((city) => (
                        <button
                            key={city}
                            type="button"
                            onClick={() => handleCityTagClick(city)}
                            className={`btn btn-sm rounded-pill px-3 py-1 text-capitalize ${activeCityFilter === city ? 'btn-secondary text-white border-info' : 'btn-action text-subtext'}`}
                            style={{ fontSize: '12px' }}
                        >
                            {city === 'all' ? 'All Sanctuaries' : city}
                        </button>
                    ))}
                </div>
            </section>

            {/* Fallback Notice */}
            {!isExactMatch && (
                <div className="alert alert-warning cyber-card py-3 px-3 px-md-4 d-flex flex-column flex-md-row gap-2 align-items-start align-items-md-center justify-content-between mb-4 border border-warning border-opacity-50">
                    <div className="small">
                        <i className="fa-solid fa-circle-info me-2 text-warning fs-5 align-middle"></i>
                        <strong>No exact matches for "{searchQuery}".</strong> Showing curated recommendations:
                    </div>
                    <button onClick={handleClearFilters} className="btn btn-sm btn-outline-warning text-nowrap">
                        View All Properties
                    </button>
                </div>
            )}

            {/* VIEW SWITCHER & CATALOG HEADER */}
            <section id="stays" className="mb-5">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div>
                        <h3 className="fw-bold text-white mb-1 fs-5 fs-md-4">
                            {isExactMatch ? 'Available Sanctuaries' : 'Recommended Sanctuaries'}
                        </h3>
                        <p className="text-subtext small mb-0">Showing {hotels.length} verified stays</p>
                    </div>

                    {/* 👈 GRID / MAP VIEW TOGGLE */}
                    <div className="d-flex bg-dark p-1 rounded-3 border border-secondary border-opacity-50">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`btn btn-sm px-3 py-1 fw-semibold d-flex align-items-center gap-1 ${viewMode === 'grid' ? 'btn-lightning' : 'text-subtext'}`}
                        >
                            <i className="fa-solid fa-grip"></i>
                            <span>Grid View</span>
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`btn btn-sm px-3 py-1 fw-semibold d-flex align-items-center gap-1 ${viewMode === 'map' ? 'btn-lightning' : 'text-subtext'}`}
                        >
                            <i className="fa-solid fa-map-location-dot"></i>
                            <span>Map View</span>
                        </button>
                    </div>
                </div>

                {loadingHotels ? (
                    <div className="text-center py-5">
                        <i className="fa-solid fa-spinner fa-spin fs-2 text-info mb-2"></i>
                        <p className="text-subtext">Loading sanctuaries catalogue...</p>
                    </div>
                ) : hotels.length === 0 ? (
                    <div className="cyber-card text-center py-5">
                        <i className="fa-solid fa-hotel fs-1 text-secondary mb-3"></i>
                        <h4 className="text-white">No properties available</h4>
                        <p className="text-subtext small">Try clearing your filters to view all available retreats.</p>
                        <button onClick={handleClearFilters} className="btn btn-action btn-sm">
                            Show All Properties
                        </button>
                    </div>
                ) : viewMode === 'map' ? (
                    /* ======================================================= */
                    /* 🗺️ INTERACTIVE MAP VIEW COMPONENT                       */
                    /* ======================================================= */
                    <PropertyMap hotels={hotels} onSelectHotel={(hotel) => setSelectedHotel(hotel)} />
                ) : (
                    /* ======================================================= */
                    /* 🏢 CLASSIC GRID VIEW COMPONENT                          */
                    /* ======================================================= */
                    <div className="row g-3 g-md-4">
                        {hotels.map((hotel) => (
                            <div className="col-12 col-md-6 col-lg-4" key={hotel._id}>
                                <div className="cyber-card h-100 d-flex flex-column overflow-hidden">
                                    <div className="position-relative" style={{ height: '200px' }}>
                                        <img
                                            src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                                            alt={hotel.name}
                                            className="w-100 h-100 object-fit-cover"
                                        />
                                        <span className="badge bg-dark bg-opacity-75 text-cyan-glow border border-info border-opacity-50 position-absolute top-0 start-0 m-2 m-sm-3 px-2 py-1 rounded-pill small" style={{ fontSize: '11px' }}>
                                            {hotel.tag || 'Verified Stay'}
                                        </span>
                                        <div className="badge bg-dark bg-opacity-90 position-absolute top-0 end-0 m-2 m-sm-3 px-2 py-1 text-warning small border border-secondary border-opacity-50" style={{ fontSize: '11px' }}>
                                            <i className="fa-solid fa-star me-1"></i>{hotel.rating || '4.9'} <span className="text-subtext">({hotel.reviewsCount || 12})</span>
                                        </div>
                                    </div>

                                    <div className="p-3 p-sm-4 d-flex flex-column justify-content-between grow">
                                        <div>
                                            <h5
                                                className="fw-bold text-white mb-1 cursor-pointer hover-cyan text-truncate"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => navigate(`/hotel/${hotel._id}`)}
                                            >
                                                {hotel.name}
                                            </h5>
                                            <p className="text-subtext small mb-2 text-truncate">
                                                <i className="fa-solid fa-location-dot me-1 text-info"></i>{hotel.location}
                                            </p>
                                            <p className="text-detail small mb-3" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {hotel.description}
                                            </p>

                                            <div className="d-flex flex-wrap gap-1 mb-3">
                                                {hotel.amenities?.slice(0, 3).map((item, index) => (
                                                    <span key={index} className="badge bg-dark border border-secondary border-opacity-25 text-detail px-2 py-1 small" style={{ fontSize: '11px' }}>
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25">
                                            <div>
                                                {hotel.originalPrice > hotel.pricePerNight && (
                                                    <span className="text-subtext small text-decoration-line-through me-1" style={{ fontSize: '11px' }}>₹{hotel.originalPrice}</span>
                                                )}
                                                <h5 className="fw-bold text-cyan-glow mb-0 d-inline">₹{hotel.pricePerNight}</h5>
                                                <span className="text-subtext small" style={{ fontSize: '11px' }}> / night</span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedHotel(hotel)}
                                                className="btn btn-action btn-sm px-3 py-2 fw-semibold"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Modals */}
            {selectedHotel && (
                <BookingModal
                    hotel={selectedHotel}
                    onClose={() => setSelectedHotel(null)}
                    onBookingSuccess={(msg) => {
                        setAlertSuccess(msg);
                        setTimeout(() => setAlertSuccess(''), 6000);
                    }}
                />
            )}

            {showMyBookings && (
                <MyBookingsModal onClose={() => setShowMyBookings(false)} />
            )}

            {/* Footer */}
            <footer className="text-center py-4 border-top border-secondary border-opacity-25 text-subtext small">
                <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                    <img src={aashrayLogo} alt="Logo" style={{ width: '22px', height: '22px' }} />
                    <span className="fw-bold text-white">AASHRAY Hospitality Network</span>
                </div>
                <div>&copy; 2026 Aashray Platforms Inc. Real-time Hotel Booking Live.</div>
            </footer>

        </div>
    );
};

export default PropertyExplorer;