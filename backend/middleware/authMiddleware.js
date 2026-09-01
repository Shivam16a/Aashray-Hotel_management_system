// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/users");

const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Prioritize Authorization Header first (best for cross-domain / Render deployments)
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        // 2. Fallback to HTTP-Only Cookie
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        // Token missing check
        if (!token) {
            if (req.path === "/me" || req.baseUrl?.includes("/auth/me")) {
                req.user = null;
                return next();
            }
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please log in.",
            });
        }

        // 2. Verify token
        const secret = process.env.JWT_SECRET || "aashray_jwt_super_secure_fallback_key_2026";
        const decoded = jwt.verify(token, secret);

        const targetId = decoded.id || decoded.userId;

        const user = await User.findById(targetId).select(
            "_id username email phone role isVerified isBlocked createdAt"
        );

        if (!user) {
            req.user = null;
            if (req.path === "/me" || req.baseUrl?.includes("/auth/me")) return next();
            return res.status(401).json({
                success: false,
                message: "User account no longer exists.",
            });
        }

        // 3. Check if user is blocked by Admin
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been suspended by the administrator.",
            });
        }

        req.user = user;
        next();
    } catch (error) {
        req.user = null;
        if (req.path === "/me" || req.baseUrl?.includes("/auth/me")) return next();

        return res.status(401).json({
            success: false,
            message: "Session expired or invalid token. Please log in again.",
        });
    }
};

// 4. Role-Based Access Control (Admin / Owner Guard)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: Access restricted to [${roles.join(", ")}] roles.`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };