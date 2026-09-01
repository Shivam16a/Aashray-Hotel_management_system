// backend/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();

const {
    createRazorpayOrder,
    verifyPaymentAndBook,
    getMyBookings,
    getAllAdminBookings,
    verifyAndConfirmCheckout,
    cancelBooking,
} = require("../controllers/bookingController");

const { protect } = require("../middleware/authMiddleware");

// 1. Payment Gateway & Creation Routes
router.post("/razorpay-order", protect, createRazorpayOrder);
router.post("/verify-payment", protect, verifyPaymentAndBook);

// 2. User & Admin Bookings Ledger
router.get("/my-bookings", protect, getMyBookings);
router.get("/admin/all", protect, getAllAdminBookings);

// 3. Checkout Verification & Cancellation
router.post("/verify-checkout", protect, verifyAndConfirmCheckout);
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;