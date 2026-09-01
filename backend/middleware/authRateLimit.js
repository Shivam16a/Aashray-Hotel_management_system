// middleware/authRateLimit.js
const { rateLimit } = require("express-rate-limit");

// Helper function to extract IP as clean string
const getClientIp = (req) => {
    return (
        req.ip ||
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        "127.0.0.1"
    );
};

// ==========================================
// LOGIN - PER IP
// ==========================================
const loginIPLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7", // draft-7 or true is standard & stable
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req) => {
        return getClientIp(req);
    },
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many login attempts from this IP. Please try again after 15 minutes.",
        });
    },
});

// ==========================================
// LOGIN - PER ACCOUNT
// ==========================================
const loginAccountLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req) => {
        const email =
            typeof req.body?.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "unknown";
        return `login-account:${email}`;
    },
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many attempts on this account. Please try again after 15 minutes.",
        });
    },
});

// ==========================================
// OTP LIMITER (IP + Email)
// ==========================================
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req) => {
        const ip = getClientIp(req);
        const email =
            typeof req.body?.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "unknown";
        return `otp:${ip}:${email}`;
    },
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many OTP attempts. Please wait 10 minutes.",
        });
    },
});

// ==========================================
// FORGOT PASSWORD
// ==========================================
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    validate: false,
    keyGenerator: (req) => {
        return getClientIp(req);
    },
    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            message: "Too many password reset requests. Try again later.",
        });
    },
});

module.exports = {
    loginIPLimiter,
    loginAccountLimiter,
    otpLimiter,
    forgotPasswordLimiter,
};