require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

const connectDb = require("./config/db.js");

const app = express();
const server = http.createServer(app);

// ==========================================
// 1. MONGOOSE SECURITY & INJECTION SHIELD
// ==========================================
mongoose.set("sanitizeFilter", true);
mongoose.set("strictQuery", false);

// ==========================================
// 2. TRUST PROXY CONFIGURATION
// ==========================================
if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
} else {
    app.set("trust proxy", false);
}

// ==========================================
// 3. ADVANCED HTTP SECURITY HEADERS (HELMET)
// ==========================================
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false,
        hidePoweredBy: true,
    })
);

// ==========================================
// 4. RATE LIMITING (BRUTE FORCE & DOS SHIELD)
// ==========================================
const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP. Please wait 15 minutes before trying again.",
    },
});
app.use("/api", globalApiLimiter);

const sensitiveAuthLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 Minutes
    max: 12,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts. Your IP has been temporarily throttled for 10 minutes.",
    },
});
app.use("/api/auth/login", sensitiveAuthLimiter);
app.use("/api/auth/verify-otp", sensitiveAuthLimiter);
app.use("/api/auth/forgot-password", sensitiveAuthLimiter);
app.use("/api/auth/reset-password", sensitiveAuthLimiter);

// ==========================================
// 5. STRICT CORS & SOCKET.IO SETUP
// ==========================================
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean);

// Initialize WebSockets
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

app.set("io", io);

io.on("connection", (socket) => {
    // Private User Room
    socket.on("join-user-room", (userId) => {
        if (userId) socket.join(`user_${userId}`);
    });

    // Admin Channel Room
    socket.on("join-admin-room", () => {
        socket.join("admin_room");
    });

    socket.on("disconnect", () => { });
});

// Express CORS
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(null, false);
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// ==========================================
// 6. BODY PARSER WITH PAYLOAD LIMITS
// ==========================================
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// ==========================================
// 7. DATA SANITIZATION (EXPRESS 5 COMPATIBLE)
// ==========================================
const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== "object") return;
    Object.keys(obj).forEach((key) => {
        if (key.startsWith("$") || key.includes(".")) {
            delete obj[key];
        } else if (typeof obj[key] === "object") {
            sanitizeObject(obj[key]);
        }
    });
};

app.use((req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.params) sanitizeObject(req.params);
    if (req.query) sanitizeObject(req.query);
    next();
});

app.use(
    hpp({
        whitelist: ["city", "pricePerNight", "rating", "guestsCount"],
    })
);

// ==========================================
// 8. APPLICATION ROUTES
// ==========================================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/hotels", require("./routes/hotelRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

// ==========================================
// 9. 404 HANDLER
// ==========================================
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Endpoint not found on Aashray Secure Gateway.",
    });
});

// ==========================================
// 10. GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
    console.error("SECURE_GATEWAY_ERROR:", err);
    const isDev = process.env.NODE_ENV === "development";
    return res.status(err.status || 500).json({
        success: false,
        message: isDev ? err.message : "Internal Server Error. Request blocked or failed.",
    });
});

// ==========================================
// 11. SERVER BOOTSTRAP
// ==========================================
const PORT = process.env.PORT || 5000;

connectDb()
    .then(() => {
        // Socket.io ke saath HTTP wrapper server bind hoga
        server.listen(PORT, () => {
            console.log(`🛡️  Aashray Secure Server with WebSockets running on port :${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
        process.exit(1);
    });