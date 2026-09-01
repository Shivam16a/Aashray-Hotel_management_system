const express = require("express");

const router = express.Router();

const {
    register,
    verifyOTP,
    login,
    forgotPassword,
    resetPassword,
    getMe,
    logout,
    updateProfile,
    changePassword
} = require("../controllers/authController");

const {
    loginIPLimiter,
    loginAccountLimiter,
    otpLimiter,
    forgotPasswordLimiter,
} = require("../middleware/authRateLimit");

const { protect } = require("../middleware/authMiddleware");


// ==========================================
// REGISTER
// ==========================================

router.post(
    "/register",
    register
);


// ==========================================
// VERIFY OTP
// ==========================================

router.post(
    "/verify-otp",
    otpLimiter,
    verifyOTP
);


// ==========================================
// LOGIN
// ==========================================

router.post(
    "/login",

    // Both limits must pass
    loginIPLimiter,
    loginAccountLimiter,

    login
);


// ==========================================
// FORGOT PASSWORD
// ==========================================

router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    forgotPassword
);


// ==========================================
// RESET PASSWORD
// ==========================================

router.post(
    "/reset-password",
    otpLimiter,
    resetPassword
);

router.get(
    "/me",
    protect,
    getMe
);
router.post(
    "/logout",
    protect,
    logout
);

router.put("/update-profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;