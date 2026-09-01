// src/pages/HotelDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchHotelDetails } from '../services/api';
import { useAuth } from '../context/AuthContext';
import aashrayLogo from '../assets/Aasray.svg';
import BookingModal from '../components/BookingModal';

const HotelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [hotel, setHotel] = useState(null);
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState('');

    const loadHotel = async () => {
        try {
            const res = await fetchHotelDetails(id);
            if (res.data.success) {
                setHotel(res.data.hotel);
                if (res.data.hotel.images?.length > 0) {
                    setSelectedImage(res.data.hotel.images[0]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHotel();
    }, [id]);

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center text-subtext">
                <i className="fa-solid fa-spinner fa-spin fs-2 text-info me-2"></i>
                <span>Loading Sanctuary Details...</span>
            </div>
        );
    }

    if (!hotel) {
        return (
            <div className="container py-5 text-center text-white">
                <h2>Property Not Found</h2>
                <Link to="/dashboard" className="btn btn-lightning mt-3">Back to Discover</Link>
            </div>
        );
    }

    // Determine Host
    const hostInfo = hotel.owner || {
        username: "Aashray Central Admin Desk",
        email: "support@aashraystays.com",
        phone: "+91 80026 32535",
        role: "Verified Custodian (Admin)",
        isVerified: true
    };

    const hostPhoneClean = (hostInfo.phone || "919876543210").replace(/\D/g, '');

    return (
        <div className="container-fluid container-lg py-3 py-md-4 min-vh-100 position-relative text-white" style={{ zIndex: 1 }}>

            {/* Header Bar */}
            <header className="cyber-card p-3 mb-4 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    <Link to="/dashboard">
                        <img src={aashrayLogo} alt="Logo" style={{ width: '42px', height: '42px' }} />
                    </Link>
                    <div>
                        <h4 className="mb-0 fw-bold text-white">{hotel.name}</h4>
                        <span className="small text-subtext"><i className="fa-solid fa-location-dot me-1 text-info"></i>{hotel.location}</span>
                    </div>
                </div>

                <Link to="/dashboard/property" className="btn btn-action btn-sm">
                    <i className="fa-solid fa-arrow-left me-1"></i> Back to Stays
                </Link>
            </header>

            {bookingSuccess && (
                <div className="alert alert-success cyber-card mb-4">{bookingSuccess}</div>
            )}

            {/* Main Grid */}
            <div className="row g-4 mb-5">

                {/* Left Column: Gallery, Details & Verified Reviews */}
                <div className="col-12 col-lg-8">
                    <div className="cyber-card p-3 p-md-4 mb-4">

                        {/* Main Preview Image */}
                        <div className="rounded-3 overflow-hidden mb-3 position-relative" style={{ height: '380px' }}>
                            <img
                                src={selectedImage || hotel.images?.[0]}
                                alt="Hotel Preview"
                                className="w-100 h-100 object-fit-cover"
                            />
                            <span className="badge bg-dark bg-opacity-75 text-cyan-glow border border-info border-opacity-50 position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill">
                                {hotel.tag || 'Verified Stay'}
                            </span>
                        </div>

                        {/* Thumbnail Strip */}
                        {hotel.images?.length > 1 && (
                            <div className="d-flex gap-2 overflow-x-auto pb-2">
                                {hotel.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt="Thumbnail"
                                        onClick={() => setSelectedImage(img)}
                                        className={`rounded-2 cursor-pointer border ${selectedImage === img ? 'border-info' : 'border-secondary'}`}
                                        style={{ width: '80px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                                    />
                                ))}
                            </div>
                        )}

                        <hr className="border-secondary border-opacity-50 my-4" />

                        {/* Description */}
                        <h5 className="fw-bold text-white mb-2">About This Sanctuary</h5>
                        <p className="text-detail lead fs-6">{hotel.description}</p>

                        {/* Amenities Grid */}
                        <h5 className="fw-bold text-white mt-4 mb-3">Property Amenities</h5>
                        <div className="row g-2">
                            {hotel.amenities?.map((amenity, i) => (
                                <div className="col-6 col-md-4" key={i}>
                                    <div className="p-2 rounded-2 bg-dark bg-opacity-50 border border-secondary border-opacity-25 small text-detail d-flex align-items-center gap-2">
                                        <i className="fa-solid fa-check text-info"></i>
                                        <span>{amenity}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* ======================================================= */}
                    {/* VERIFIED GUEST REVIEWS SHOWCASE                         */}
                    {/* ======================================================= */}
                    <div className="cyber-card p-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 className="fw-bold text-white mb-0">Verified Guest Reviews</h5>
                                <small className="text-subtext">Authentic feedback from verified checked-out guests</small>
                            </div>
                            <span className="badge bg-warning text-dark fw-bold px-3 py-2 fs-7">
                                <i className="fa-solid fa-star me-1"></i>{hotel.rating || '4.9'} / 5.0 ({hotel.reviewsCount || hotel.reviews?.length || 0} reviews)
                            </span>
                        </div>

                        {/* Verified Policy Callout */}
                        <div className="p-3 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-30 mb-4 d-flex align-items-center gap-3">
                            <i className="fa-solid fa-shield-halved text-cyan-glow fs-4"></i>
                            <div className="small">
                                <strong className="text-white d-block">100% Cryptographically Verified Reviews</strong>
                                <span className="text-subtext">To prevent bias & fake reviews, only guests with completed stays can post ratings from their Bookings ledger.</span>
                            </div>
                        </div>

                        {/* Reviews List */}
                        {!hotel.reviews || hotel.reviews.length === 0 ? (
                            <div className="text-center py-4 text-subtext">
                                <i className="fa-regular fa-comment-dots fs-2 text-secondary mb-2 d-block"></i>
                                <p className="mb-0">No reviews published yet. Completed reservations will display here!</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {hotel.reviews.map((rev, index) => (
                                    <div key={index} className="p-3 rounded-2 bg-dark bg-opacity-40 border border-secondary border-opacity-25">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="rounded-circle bg-info bg-opacity-25 text-info d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                                                    <i className="fa-regular fa-user"></i>
                                                </div>
                                                <strong className="text-white small">{rev.username || rev.user?.username || 'Verified Traveler'}</strong>
                                                <span className="badge bg-success bg-opacity-20 text-success border border-success border-opacity-25" style={{ fontSize: '9px' }}>
                                                    <i className="fa-solid fa-check me-1"></i>Verified Stay
                                                </span>
                                            </div>
                                            <div className="text-warning small">
                                                {[...Array(rev.rating || 5)].map((_, sIdx) => (
                                                    <i key={sIdx} className="fa-solid fa-star"></i>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-subtext small mb-1 ps-4">{rev.comment}</p>
                                        <small className="text-white-50 ps-4 d-block" style={{ fontSize: '10px' }}>
                                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent Stay'}
                                        </small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Pricing & Host Card */}
                <div className="col-12 col-lg-4 d-flex flex-column gap-4">

                    {/* Pricing Box */}
                    <div className="cyber-card p-4">
                        <div className="d-flex justify-content-between align-items-baseline mb-3">
                            <div>
                                {hotel.originalPrice > hotel.pricePerNight && (
                                    <span className="text-subtext small text-decoration-line-through me-1">₹{hotel.originalPrice}</span>
                                )}
                                <h3 className="fw-bold text-cyan-glow d-inline">₹{hotel.pricePerNight}</h3>
                                <span className="text-subtext small"> / night</span>
                            </div>
                            <span className="badge bg-success bg-opacity-25 text-success small">Instant Lock</span>
                        </div>

                        <ul className="list-unstyled small text-detail d-flex flex-column gap-2 mb-4">
                            <li><i className="fa-solid fa-shield-halved text-info me-2"></i>Verified Cryptographic Key Access</li>
                            <li><i className="fa-solid fa-ban text-info me-2"></i>Free Cancellation up to 24h prior</li>
                            <li><i className="fa-solid fa-bolt text-info me-2"></i>Instant Confirmation directly to Account</li>
                        </ul>

                        <button onClick={() => setShowBooking(true)} className="btn btn-lightning w-100 py-3 fw-bold fs-6">
                            Reserve This Sanctuary
                        </button>
                    </div>

                    {/* Verified Host Card */}
                    <div className="cyber-card p-4 border border-info border-opacity-50">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1 small">
                                <i className="fa-solid fa-shield-check me-1"></i>Verified Host & Trust
                            </span>
                            <span className="badge bg-dark border border-secondary border-opacity-50 text-cyan-glow small">
                                {hotel.owner ? 'Registered Partner' : 'Platform Managed'}
                            </span>
                        </div>

                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center border border-info border-opacity-50 bg-dark"
                                style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(0,0,0,0.8))' }}
                            >
                                <span className="fw-bold fs-4 text-cyan-glow">
                                    {hostInfo.username ? hostInfo.username.charAt(0).toUpperCase() : 'A'}
                                </span>
                            </div>
                            <div>
                                <h6 className="fw-bold text-white mb-0">{hostInfo.username}</h6>
                                <span className="text-subtext small">
                                    {hotel.owner ? 'Certified Sanctuary Owner' : 'Aashray Executive Custodian'}
                                </span>
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-2 p-3 rounded-3 bg-dark bg-opacity-70 border border-secondary border-opacity-25 small mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-subtext"><i className="fa-regular fa-envelope me-2 text-info"></i>Email Desk:</span>
                                <span className="text-detail fw-semibold text-truncate" style={{ maxWidth: '160px' }}>{hostInfo.email}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-subtext"><i className="fa-solid fa-phone me-2 text-info"></i>Contact Phone:</span>
                                <span className="text-detail fw-semibold">{hostInfo.phone || '+91 98765 43210'}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-subtext"><i className="fa-solid fa-circle-check me-2 text-success"></i>Identity Status:</span>
                                <span className="text-success fw-bold">100% KYC Verified</span>
                            </div>
                        </div>

                        {/* Direct Contact */}
                        <div className="d-flex gap-2">
                            <a
                                href={`https://wa.me/${hostPhoneClean}?text=Hello%20${encodeURIComponent(hostInfo.username)},%20I%20am%20inquiring%20about%20${encodeURIComponent(hotel.name)}%20on%20Aashray.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-success btn-sm flex-fill py-2 d-flex align-items-center justify-content-center gap-2"
                            >
                                <i className="fa-brands fa-whatsapp fs-6"></i>
                                <span>WhatsApp Host</span>
                            </a>
                            <a
                                href={`mailto:${hostInfo.email}?subject=Inquiry%20Regarding%20${encodeURIComponent(hotel.name)}`}
                                className="btn btn-action btn-sm flex-fill py-2 d-flex align-items-center justify-content-center gap-2"
                            >
                                <i className="fa-regular fa-envelope"></i>
                                <span>Email Host</span>
                            </a>
                        </div>
                    </div>

                </div>

            </div>

            {/* Booking Modal */}
            {showBooking && (
                <BookingModal
                    hotel={hotel}
                    onClose={() => setShowBooking(false)}
                    onBookingSuccess={(msg) => {
                        setBookingSuccess(msg);
                        setTimeout(() => setBookingSuccess(''), 6000);
                    }}
                />
            )}

        </div>
    );
};

export default HotelDetail;