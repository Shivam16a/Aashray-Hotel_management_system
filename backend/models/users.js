// backend/models/users.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
        password: { type: String, required: true, select: false },
        otp: { type: String, select: false },
        otpExpire: { type: Date, select: false },
        isVerified: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false }, // 👈 New field for blocking users
        role: { type: String, enum: ["Admin", "User", "Owner"], default: "User" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);