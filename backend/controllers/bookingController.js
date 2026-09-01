// backend/controllers/bookingController.js
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// ==========================================
// RAZORPAY INSTANCE
// ==========================================
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// ==========================================
// EMAIL TRANSPORTER
// ==========================================
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

// ==========================================
// 1. CREATE RAZORPAY ORDER
// ==========================================
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { hotelId, checkInDate, checkOutDate } = req.body;

        if (!hotelId || !checkInDate || !checkOutDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide hotel ID, check-in, and check-out dates.",
            });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found." });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        if (checkOut <= checkIn) {
            return res.status(400).json({
                success: false,
                message: "Check-out date must be after check-in date.",
            });
        }

        const diffTime = Math.abs(checkOut - checkIn);
        const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const totalAmount = totalNights * hotel.pricePerNight;

        const options = {
            amount: Math.round(totalAmount * 100), // Amount in paise
            currency: "INR",
            receipt: `rcpt_${Date.now().toString().slice(-8)}`,
        };

        const order = await razorpayInstance.orders.create(options);

        return res.status(200).json({
            success: true,
            order,
            totalAmount,
            totalNights,
            hotelName: hotel.name,
        });
    } catch (error) {
        console.error("RAZORPAY_ORDER_ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to initiate payment gateway.",
        });
    }
};

// ==========================================
// 2. VERIFY PAYMENT & CREATE BOOKING
// ==========================================
exports.verifyPaymentAndBook = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            hotelId,
            checkInDate,
            checkOutDate,
            guestsCount,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Incomplete payment verification payload.",
            });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            console.error("❌ RAZORPAY_KEY_SECRET missing in .env");
            return res.status(500).json({
                success: false,
                message: "Server configuration error: Payment secret key missing.",
            });
        }

        // HMAC SHA256 Signature Verification
        const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            console.error("❌ Signature mismatch:", { generatedSignature, razorpay_signature });
            return res.status(400).json({
                success: false,
                message: "Payment verification failed: Invalid cryptographic signature.",
            });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found." });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const diffTime = Math.abs(checkOut - checkIn);
        const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const totalPrice = totalNights * hotel.pricePerNight;

        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const checkoutCode = `ASH-${randomDigits}`;

        const booking = await Booking.create({
            user: req.user._id,
            hotel: hotelId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            guestsCount: guestsCount || 1,
            totalNights,
            totalPrice,
            status: "Confirmed",
            checkoutCode,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
        });

        const populatedBooking = await Booking.findById(booking._id).populate(
            "hotel",
            "name location images pricePerNight"
        );

        // WebSockets Event Dispatch
        const io = req.app.get("io");
        if (io) {
            io.to("admin_room").emit("new-booking-alert", {
                message: `New Sanctuary Reserved: ${hotel.name} by ${req.user.username || "Guest"}!`,
                booking: populatedBooking,
            });
            io.to(`user_${req.user._id}`).emit("booking-confirmed", populatedBooking);
        }

        // Send Email Confirmation
        try {
            const transporter = createTransporter();
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; background-color: #060913; color: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #00f0ff; max-width: 600px; margin: auto;">
                    <h2 style="color: #00f0ff; margin-bottom: 5px;">⚡ Aashray Booking Confirmation</h2>
                    <p style="color: #94a3b8; font-size: 14px;">Your payment of <strong>₹${totalPrice}</strong> was verified and confirmed!</p>
                    <div style="background-color: #0d1322; padding: 18px; border-radius: 10px; margin: 15px 0;">
                        <h3 style="color: #ffffff; margin-top: 0;">${hotel.name}</h3>
                        <p style="color: #94a3b8; margin: 4px 0;"><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
                        <p style="color: #94a3b8; margin: 4px 0;"><strong>Check-In:</strong> ${checkIn.toDateString()}</p>
                        <p style="color: #94a3b8; margin: 4px 0;"><strong>Check-Out:</strong> ${checkOut.toDateString()}</p>
                        <p style="color: #00f0ff; font-size: 18px; margin: 10px 0 0 0;"><strong>Total Paid:</strong> ₹${totalPrice}</p>
                    </div>
                    <div style="text-align: center; background: rgba(0, 240, 255, 0.08); padding: 16px; border-radius: 10px; border: 1px dashed #00f0ff; margin: 18px 0;">
                        <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Checkout Security Pass</span>
                        <div style="font-size: 28px; font-weight: bold; color: #00f0ff; letter-spacing: 4px; margin-top: 6px;">${checkoutCode}</div>
                    </div>
                </div>
            `;

            await transporter.sendMail({
                from: `"Aashray Hospitality Network" <${process.env.EMAIL}>`,
                to: req.user.email,
                subject: `Booking Confirmed: ${hotel.name} [Pass: ${checkoutCode}]`,
                html: emailHtml,
            });
        } catch (mailErr) {
            console.error("VOUCHER_EMAIL_FAIL:", mailErr.message);
        }

        return res.status(201).json({
            success: true,
            message: `Payment verified! Checkout pass (${checkoutCode}) sent to email.`,
            checkoutCode,
            booking: populatedBooking,
        });
    } catch (error) {
        console.error("VERIFY_PAYMENT_ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Payment verification failed on server.",
        });
    }
};

// ==========================================
// 3. GET USER'S BOOKINGS
// ==========================================
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("hotel", "name location city images pricePerNight")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user bookings.",
        });
    }
};

// ==========================================
// 4. GET ALL BOOKINGS (ADMIN / OWNER)
// ==========================================
exports.getAllAdminBookings = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === "Owner") {
            const myHotels = await Hotel.find({ owner: req.user._id }).select("_id");
            const hotelIds = myHotels.map((h) => h._id);
            filter = { hotel: { $in: hotelIds } };
        }

        const bookings = await Booking.find(filter)
            .populate("user", "username email phone")
            .populate({
                path: "hotel",
                select: "name location city pricePerNight images owner",
                populate: {
                    path: "owner",
                    select: "username email phone role",
                },
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: bookings.length,
            bookings: bookings || [],
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch master bookings ledger.",
        });
    }
};

// ==========================================
// 5. VERIFY CHECKOUT CODE
// ==========================================
exports.verifyAndConfirmCheckout = async (req, res) => {
    try {
        const { checkoutCode } = req.body;

        if (!checkoutCode) {
            return res.status(400).json({
                success: false,
                message: "Please enter the guest checkout code.",
            });
        }

        const booking = await Booking.findOne({
            checkoutCode: checkoutCode.trim().toUpperCase(),
        })
            .populate("hotel", "name location")
            .populate("user", "username email phone");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Invalid checkout code. No active reservation found.",
            });
        }

        if (booking.status === "Checked-Out") {
            return res.status(400).json({
                success: false,
                message: "This booking has already been checked out and locked.",
            });
        }

        if (booking.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Cannot checkout a cancelled reservation.",
            });
        }

        booking.status = "Checked-Out";
        booking.checkedOutAt = new Date();
        await booking.save();

        const io = req.app.get("io");
        if (io) {
            io.to(`user_${booking.user?._id}`).emit("checkout-verified-sync", {
                bookingId: booking._id,
                checkoutCode: booking.checkoutCode,
                status: "Checked-Out",
                checkedOutAt: booking.checkedOutAt,
            });
            io.to("admin_room").emit("admin-checkout-sync", {
                bookingId: booking._id,
                status: "Checked-Out",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Checkout confirmed for ${booking.user?.username || "Guest"}! Stay is now locked.`,
            booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Checkout verification failed.",
        });
    }
};

// ==========================================
// 6. CANCEL BOOKING
// ==========================================
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or unauthorized.",
            });
        }

        if (booking.status === "Checked-Out") {
            return res.status(403).json({
                success: false,
                message: "Action Denied: This stay is completed and checked-out. Cancellation is permanently locked.",
            });
        }

        if (booking.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled.",
            });
        }

        booking.status = "Cancelled";
        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Reservation cancelled successfully.",
            booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to cancel reservation.",
        });
    }
};