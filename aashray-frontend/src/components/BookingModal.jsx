// src/components/BookingModal.jsx
import React, { useState } from 'react';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Dynamic script loader helper
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            return resolve(true);
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const BookingModal = ({ hotel, onClose, onBookingSuccess }) => {
    const { user } = useAuth();
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [checkInDate, setCheckInDate] = useState(today);
    const [checkOutDate, setCheckOutDate] = useState(tomorrow);
    const [guestsCount, setGuestsCount] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmedPass, setConfirmedPass] = useState(null);

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    const diffTime = outDate - inDate;
    const nights = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
    const totalPrice = nights > 0 ? nights * hotel.pricePerNight : 0;

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (nights <= 0) {
            setError('Check-out date must be after check-in date.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 1. Dynamic SDK Load
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
            }

            // 2. Create Order on Backend
            const orderRes = await createRazorpayOrder({
                hotelId: hotel._id,
                checkInDate,
                checkOutDate,
            });

            if (!orderRes.data.success) {
                throw new Error(orderRes.data.message || 'Order creation failed.');
            }

            const { order } = orderRes.data;

            // 3. Open Razorpay Gateway Popup
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Aashray Stays & Sanctuaries",
                description: `Booking for ${hotel.name}`,
                order_id: order.id,
                prefill: {
                    name: user?.username || "Guest",
                    email: user?.email || "",
                    contact: user?.phone || "",
                },
                theme: {
                    color: "#00f0ff",
                },
                handler: async function (response) {
                    try {
                        const verifyRes = await verifyRazorpayPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            hotelId: hotel._id,
                            checkInDate,
                            checkOutDate,
                            guestsCount: Number(guestsCount),
                        });

                        if (verifyRes.data.success) {
                            setConfirmedPass(verifyRes.data.checkoutCode);
                            onBookingSuccess(verifyRes.data.message);
                        }
                    } catch (verifyErr) {
                        setError(verifyErr.response?.data?.message || "Payment verification failed.");
                    }
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setError(`Payment Failed: ${response.error.description}`);
            });
            rzp.open();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to initiate checkout.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ background: 'rgba(0, 0, 0, 0.85)', zIndex: 1050, backdropFilter: 'blur(8px)' }}>
            <div className="cyber-card p-4 p-md-5" style={{ maxWidth: '520px', width: '100%' }}>

                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <span className="badge bg-info text-dark rounded-pill fw-bold small mb-1">{hotel.tag || 'Sanctuary'}</span>
                        <h4 className="fw-bold text-white mb-0">{hotel.name}</h4>
                        <small className="text-subtext"><i className="fa-solid fa-location-dot me-1 text-info"></i>{hotel.location}</small>
                    </div>
                    <button onClick={onClose} className="btn btn-sm btn-outline-secondary rounded-circle">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger py-2 small d-flex align-items-center mb-3">
                        <i className="fa-solid fa-triangle-exclamation me-2"></i>
                        <div>{error}</div>
                    </div>
                )}

                {confirmedPass ? (
                    <div className="text-center py-3">
                        <div className="rounded-circle bg-success bg-opacity-25 text-success d-inline-flex p-3 mb-3 border border-success border-opacity-50">
                            <i className="fa-solid fa-circle-check fs-2"></i>
                        </div>
                        <h5 className="fw-bold text-white mb-1">Payment & Stay Confirmed!</h5>
                        <p className="text-subtext small mb-3">Receipt and verification voucher dispatched to your registered email.</p>

                        <div className="p-3 rounded-3 bg-dark border border-info border-opacity-50 mb-4">
                            <span className="text-subtext small text-uppercase">Your Checkout Departure Pass</span>
                            <div className="fs-3 fw-bold text-cyan-glow font-monospace tracking-wider mt-1">{confirmedPass}</div>
                            <small className="text-warning d-block mt-2" style={{ fontSize: '11px' }}>
                                ⚠️ Show this pass to the property manager at departure.
                            </small>
                        </div>

                        <button onClick={onClose} className="btn btn-lightning w-100 py-2 fw-semibold">
                            Done & View in My Bookings
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handlePaymentSubmit}>
                        <div className="row g-3 mb-3">
                            <div className="col-6">
                                <label className="text-subtext small mb-1">Check In</label>
                                <input
                                    type="date"
                                    min={today}
                                    className="form-control cyber-input"
                                    value={checkInDate}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="col-6">
                                <label className="text-subtext small mb-1">Check Out</label>
                                <input
                                    type="date"
                                    min={checkInDate || today}
                                    className="form-control cyber-input"
                                    value={checkOutDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="text-subtext small mb-1">Guests</label>
                            <select
                                className="form-select cyber-input"
                                value={guestsCount}
                                onChange={(e) => setGuestsCount(e.target.value)}
                            >
                                <option value="1">1 Guest</option>
                                <option value="2">2 Guests</option>
                                <option value="3">3 Guests</option>
                                <option value="4">4 Guests</option>
                            </select>
                        </div>

                        <div className="p-3 rounded-3 bg-dark border border-secondary border-opacity-50 mb-4">
                            <div className="d-flex justify-content-between small text-subtext mb-1">
                                <span>Rate:</span>
                                <span className="text-white">₹{hotel.pricePerNight} / night</span>
                            </div>
                            <div className="d-flex justify-content-between small text-subtext mb-2">
                                <span>Duration:</span>
                                <span className="text-white">{nights} Night(s)</span>
                            </div>
                            <hr className="border-secondary my-2" />
                            <div className="d-flex justify-content-between fw-bold">
                                <span className="text-white">Total Amount:</span>
                                <span className="text-cyan-glow fs-5">₹{totalPrice}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-lightning w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                            disabled={loading || nights <= 0}
                        >
                            {loading ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    <span>Initiating Secure Gateway...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-lock"></i>
                                    <span>Pay ₹{totalPrice} & Lock Sanctuary</span>
                                </>
                            )}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default BookingModal;