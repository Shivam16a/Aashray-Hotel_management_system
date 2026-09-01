import React, { useState, useEffect } from 'react';
import { fetchMyBookings, cancelUserBooking, addReview } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { socket } from '../services/socket';
import { generateBookingInvoicePDF } from '../utils/generateInvoicePDF';

const MyBookingsModal = ({ onClose }) => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);

    // Review Form State inside Modal
    const [reviewingHotel, setReviewingHotel] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        if (user?._id) {
            socket.emit('join-user-room', user._id);
        }

        // When host confirms checkout, sync card live without reload
        socket.on('checkout-verified-sync', (data) => {
            setBookings((prev) =>
                prev.map((b) =>
                    b._id === data.bookingId || b.checkoutCode === data.checkoutCode
                        ? { ...b, status: 'Checked-Out' }
                        : b
                )
            );
            setMsg(`Departure verified for stay (${data.checkoutCode}). Status updated to Checked-Out.`);
        });

        return () => {
            socket.off('checkout-verified-sync');
        };
    }, [user]);

    const loadBookings = async () => {
        try {
            const res = await fetchMyBookings();
            if (res.data.success) {
                setBookings(res.data.bookings || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const res = await cancelUserBooking(id);
            if (res.data.success) {
                setMsg('Booking cancelled successfully.');
                loadBookings();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel');
        }
    };

    const handleDownloadPDF = async (booking) => {
        setDownloadingId(booking._id);
        try {
            await generateBookingInvoicePDF(booking, user);
        } catch (error) {
            console.error('PDF Generation Failed:', error);
            alert('Failed to generate PDF voucher.');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setSubmittingReview(true);
        try {
            const res = await addReview(reviewingHotel._id, { rating, comment });
            if (res.data.success) {
                setMsg('Thank you! Your verified review has been published.');
                setReviewingHotel(null);
                setComment('');
                loadBookings();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ background: 'rgba(0, 0, 0, 0.8)', zIndex: 1050, backdropFilter: 'blur(8px)' }}>
            <div className="cyber-card p-4 p-md-5" style={{ maxWidth: '680px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold text-white mb-0"><i className="fa-solid fa-suitcase me-2 text-info"></i>My Bookings</h4>
                    <button onClick={onClose} className="btn btn-sm btn-outline-secondary rounded-circle">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {msg && <div className="alert alert-success py-2 small mb-3">{msg}</div>}

                {/* Review Form Popup Box */}
                {reviewingHotel && (
                    <form onSubmit={handleReviewSubmit} className="p-3 mb-4 rounded-3 bg-dark border border-info border-opacity-50">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="text-white fw-bold mb-0">Review: {reviewingHotel.name}</h6>
                            <button type="button" onClick={() => setReviewingHotel(null)} className="btn btn-sm text-subtext p-0">Cancel</button>
                        </div>

                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="small text-subtext">Rating:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setRating(star)} className="btn btn-sm p-0 bg-transparent border-0 fs-5">
                                    <i className={`fa-star ${star <= rating ? 'fa-solid text-warning' : 'fa-regular text-secondary'}`}></i>
                                </button>
                            ))}
                        </div>

                        <textarea
                            rows="2"
                            required
                            className="form-control cyber-input mb-2"
                            placeholder="Share your stay experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>

                        <button type="submit" disabled={submittingReview} className="btn btn-lightning btn-sm py-1 px-3">
                            {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                        </button>
                    </form>
                )}

                {loading ? (
                    <div className="text-center py-5 text-subtext">
                        <i className="fa-solid fa-spinner fa-spin fs-3 text-info mb-2"></i>
                        <p>Loading your reservations...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-5 text-subtext">
                        <i className="fa-solid fa-hotel fs-1 text-secondary mb-3"></i>
                        <h5>No bookings found</h5>
                        <p className="small">Explore our sanctuaries and make your first reservation today.</p>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {bookings.map((b) => (
                            <div key={b._id} className="p-3 rounded-3 bg-dark border border-secondary border-opacity-50">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <h6 className="fw-bold text-white mb-1">{b.hotel?.name || 'Hotel'}</h6>
                                        <small className="text-subtext"><i className="fa-solid fa-location-dot me-1 text-info"></i>{b.hotel?.location}</small>
                                    </div>
                                    <span className={`badge ${b.status === 'Confirmed' ? 'bg-success' : b.status === 'Checked-Out' ? 'bg-secondary' : 'bg-danger'} px-2 py-1`}>
                                        {b.status}
                                    </span>
                                </div>

                                <div className="d-flex flex-wrap justify-content-between align-items-center small text-detail pt-2 border-top border-secondary border-opacity-25 mt-2">
                                    <div>
                                        <span className="text-subtext">Check In: </span>
                                        <span>{new Date(b.checkInDate).toLocaleDateString()}</span>
                                        <span className="text-subtext ms-3">Check Out: </span>
                                        <span>{new Date(b.checkOutDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="fw-bold text-cyan-glow">
                                        ₹{b.totalPrice} ({b.totalNights} Nights)
                                    </div>
                                </div>

                                {/* Security Code & Action Buttons */}
                                <div className="d-flex flex-wrap justify-content-between align-items-center pt-2 mt-2 border-top border-secondary border-opacity-25 gap-2">
                                    <div className="small">
                                        <span className="text-subtext me-1">Departure Pass:</span>
                                        <span className="badge bg-dark border border-info border-opacity-50 text-cyan-glow font-monospace">
                                            {b.checkoutCode || 'ASH-7492'}
                                        </span>
                                    </div>

                                    <div className="d-flex gap-2">
                                        {/* Download PDF Voucher */}
                                        <button
                                            onClick={() => handleDownloadPDF(b)}
                                            disabled={downloadingId === b._id}
                                            className="btn btn-action btn-sm py-1 px-3 d-flex align-items-center gap-1"
                                            title="Download PDF Invoice Voucher"
                                        >
                                            {downloadingId === b._id ? (
                                                <i className="fa-solid fa-spinner fa-spin text-info"></i>
                                            ) : (
                                                <i className="fa-solid fa-file-pdf text-danger"></i>
                                            )}
                                            <span>PDF Voucher</span>
                                        </button>

                                        {b.status === 'Checked-Out' && b.hotel && (
                                            <button
                                                onClick={() => setReviewingHotel(b.hotel)}
                                                className="btn btn-lightning btn-sm py-1 px-3 d-flex align-items-center gap-1"
                                            >
                                                <i className="fa-solid fa-star text-warning"></i>
                                                <span>Rate & Review</span>
                                            </button>
                                        )}

                                        {/* Cancel Reservation */}
                                        {b.status === 'Confirmed' && (
                                            <button onClick={() => handleCancel(b._id)} className="btn btn-outline-danger btn-sm py-1 px-3">
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default MyBookingsModal;