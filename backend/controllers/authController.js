const User = require("../models/users");
const bcrypt = require("bcryptjs");

const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const generateToken = require("../utils/generateToken");

// ==========================================
// CONSTANTS
// ==========================================

const OTP_EXPIRE_TIME = 5 * 60 * 1000;

// Dummy hash is used when user does not exist.
// This makes timing more consistent and helps
// reduce user-enumeration through response timing.
const DUMMY_PASSWORD_HASH =
    "$2b$12$C6UzMDM.H6dfI/f/IKcEeP1FQ4wYz7Wz6z8G8J4X4h8j8e8w8Y6a";

// ==========================================
// HELPERS
// ==========================================

const normalizeEmail = (email) => {
    return String(email).trim().toLowerCase();
};

const cleanString = (value) => {
    return typeof value === "string" ? value.trim() : "";
};

const safeUserResponse = (user) => {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
    };
};

// ==========================================
// REGISTER
// ==========================================

exports.register = async (req, res) => {
    try {
        const username = cleanString(req.body.username);
        const email = normalizeEmail(req.body.email);
        const phone = cleanString(req.body.phone);
        const password = req.body.password;

        // --------------------------------------
        // Basic validation
        // --------------------------------------

        if (!username || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration details",
            });
        }

        // --------------------------------------
        // Email format
        // --------------------------------------

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration details",
            });
        }

        // --------------------------------------
        // Username
        // --------------------------------------

        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration details",
            });
        }

        // Only letters, numbers, spaces, _ and -
        if (!/^[a-zA-Z0-9 _-]+$/.test(username)) {
            return res.status(400).json({
                success: false,
                message: "Invalid registration details",
            });
        }

        // --------------------------------------
        // Password
        // --------------------------------------

        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters",
            });
        }

        if (password.length > 128) {
            return res.status(400).json({
                success: false,
                message: "Password is too long",
            });
        }

        // --------------------------------------
        // Check existing account
        // --------------------------------------

        const existingUser = await User
            .findOne({ email })
            .select("_id isVerified");

        if (existingUser) {

            // Don't reveal whether account exists.
            return res.status(200).json({
                success: true,
                message:
                    "If this email is eligible, an OTP has been sent.",
            });
        }

        // --------------------------------------
        // Hash password
        // --------------------------------------

        const hashedPassword =
            await bcrypt.hash(password, 12);

        // --------------------------------------
        // Generate OTP
        // --------------------------------------

        const otp = generateOTP();

        // --------------------------------------
        // Create user
        // --------------------------------------

        await User.create({
            username,
            email,
            phone,
            password: hashedPassword,
            otp,
            otpExpire: Date.now() + OTP_EXPIRE_TIME,
            isVerified: false,
            role: "User",
        });

        // --------------------------------------
        // Send OTP
        // --------------------------------------

        await sendEmail(email, otp);

        return res.status(201).json({
            success: true,
            message:
                "If this email is eligible, an OTP has been sent.",
        });

    } catch (error) {

        console.error("REGISTER_ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};


// ==========================================
// VERIFY OTP (Updated & Fixed)
// ==========================================
exports.verifyOTP = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const otp = cleanString(req.body.otp);

        // 1. Basic validation
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        // 2. Format validation (Must be 6 digits)
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "OTP must be exactly 6 digits",
            });
        }

        // 3. IMPORTANT FIX: Explicitly include hidden fields (+otp +otpExpire +isVerified)
        const user = await User.findOne({ email }).select(
            "+otp +otpExpire +isVerified"
        );

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP or email",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Account is already verified. Please login.",
            });
        }

        // 4. Check Expiry
        if (!user.otpExpire || new Date(user.otpExpire).getTime() < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        // 5. Compare OTP
        if (String(user.otp).trim() !== String(otp).trim()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please check the code.",
            });
        }

        // 6. Verification Success - Clear OTP fields
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now log in.",
        });

    } catch (error) {
        console.error("VERIFY_OTP_ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during verification",
        });
    }
};


// ==========================================
// LOGIN CONTROLLER
// ==========================================
// controllers/authController.js

exports.login = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const password = req.body.password;

        console.log("\n================ LOGIN DEBUG ================");
        console.log("1. Incoming Email:", email);

        if (!email || typeof password !== "string" || password.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Fetch complete document with raw password
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            console.log("2. Result: User NOT FOUND in database");
            await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // controllers/authController.js inside login:
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Access Denied: Your account has been suspended by admin.",
            });
        }

        console.log("2. User Document Found:");
        console.log("   - ID:", user._id);
        console.log("   - DB Email:", user.email);
        console.log("   - isVerified Value:", user.isVerified);
        console.log("   - isVerified Type:", typeof user.isVerified);

        // Password Comparison
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("3. Password Match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Verification Check (handles both boolean true and truthy string "true")
        const isUserVerified = user.isVerified === true || String(user.isVerified).toLowerCase() === "true";
        console.log("4. Final Verification Check Passed:", isUserVerified);

        if (!isUserVerified) {
            console.log("❌ REJECTED AT VERIFICATION CHECK (403)");
            return res.status(403).json({
                success: false,
                message: "Account verification required. Please verify OTP first.",
            });
        }

        // Token Generation
        const token = generateToken(user._id);

        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: true, 
            sameSite: "none", 
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        console.log("✅ LOGIN COMPLETED (200 OK)");
        console.log("=============================================\n");

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: safeUserResponse(user),
        });

    } catch (error) {
        console.error("LOGIN_ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login",
        });
    }
};

// ==========================================
// GET CURRENT LOGGED-IN USER
// ==========================================
exports.getMe = async (req, res) => {
    try {
        // Agar user logged in hai (req.user middleware se aaya)
        if (req.user) {
            return res.status(200).json({
                success: true,
                isAuthenticated: true,
                user: req.user,
            });
        }

        // Agar user logged out hai
        return res.status(200).json({
            success: true,
            isAuthenticated: false,
            user: null,
        });
    } catch (error) {
        return res.status(200).json({
            success: false,
            isAuthenticated: false,
            user: null,
        });
    }
};

// ==========================================
// LOGOUT
// ==========================================
exports.logout = async (req, res) => {
    try {
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Logout failed",
        });
    }
};

// ==========================================
// FORGOT PASSWORD - GENERATE & SEND OTP
// ==========================================
exports.forgotPassword = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide an email address."
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email."
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "This account has been suspended by admin."
            });
        }

        // Generate 6-digit OTP using your existing utils helper
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpire = Date.now() + OTP_EXPIRE_TIME;
        await user.save();

        console.log(`🔑 [DEBUG OTP]: Password reset OTP for ${user.email} is: ${otp}`);

        // Call sendEmail exactly like register controller: (email, otp)
        await sendEmail(email, otp);

        return res.status(200).json({
            success: true,
            message: "Password reset OTP has been sent to your email.",
        });
    } catch (error) {
        console.error("FORGOT_PASS_ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send reset code. Please try again."
        });
    }
};

// ==========================================
// RESET PASSWORD - VERIFY OTP & UPDATE PASS
// ==========================================
exports.resetPassword = async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const otp = cleanString(req.body.otp);
        const newPassword = req.body.newPassword;

        // 1. Basic validation
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide email, OTP, and new password."
            });
        }

        if (typeof newPassword !== "string" || newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        // 2. Fetch user explicitly with hidden OTP fields
        const user = await User.findOne({ email }).select(
            "+password +otp +otpExpire"
        );

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP or email address."
            });
        }

        // 3. Expiry check in JavaScript (Prevents Mongoose Date CastError)
        if (!user.otpExpire || new Date(user.otpExpire).getTime() < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new code."
            });
        }

        // 4. OTP comparison
        if (String(user.otp).trim() !== String(otp).trim()) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please check the code."
            });
        }

        // 5. Hash new password with salt factor 12
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(newPassword, salt);

        // 6. Clear OTP fields
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully! You can now sign in.",
        });
    } catch (error) {
        console.error("RESET_PASS_ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reset password. Please try again."
        });
    }
};

// ==========================================
// UPDATE USER PROFILE DETAILS
// ==========================================
exports.updateProfile = async (req, res) => {
    try {
        const username = cleanString(req.body.username);
        const phone = cleanString(req.body.phone);

        if (!username || !phone) {
            return res.status(400).json({
                success: false,
                message: "Username and Phone number are required.",
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.username = username;
        user.phone = phone;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            user: safeUserResponse(user),
        });
    } catch (error) {
        console.error("UPDATE_PROFILE_ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to update profile." });
    }
};

// ==========================================
// CHANGE PASSWORD (LOGGED-IN USER)
// ==========================================
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required.",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long.",
            });
        }

        // Fetch user with hidden password field
        const user = await User.findById(req.user._id).select("+password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password does not match.",
            });
        }

        // Hash and update new password
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully!",
        });
    } catch (error) {
        console.error("CHANGE_PASS_ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to change password." });
    }
};