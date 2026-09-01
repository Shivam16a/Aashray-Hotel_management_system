// backend/controllers/adminController.js
const User = require("../models/users");
const Booking = require("../models/Booking");

// ==========================================
// GET ALL USERS (Admin Only)
// ==========================================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

// ==========================================
// UPDATE USER ROLE & DETAILS (Admin Only)
// ==========================================
exports.updateUser = async (req, res) => {
    try {
        const { username, email, phone, role, isVerified } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Prevent self-demotion if admin
        if (user._id.toString() === req.user._id.toString() && role && role !== "Admin") {
            return res.status(400).json({ success: false, message: "Admins cannot demote their own account." });
        }

        user.username = username || user.username;
        user.email = email ? email.toLowerCase().trim() : user.email;
        user.phone = phone || user.phone;
        if (role) user.role = role;
        if (typeof isVerified === "boolean") user.isVerified = isVerified;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            user,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update user." });
    }
};

// ==========================================
// TOGGLE BLOCK / UNBLOCK USER (Admin Only)
// ==========================================
exports.toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Prevent blocking self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot suspend your own admin account." });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        return res.status(200).json({
            success: true,
            message: user.isBlocked ? "User has been suspended." : "User has been reinstated.",
            isBlocked: user.isBlocked,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to toggle user status." });
    }
};

// ==========================================
// DELETE USER & ASSOCIATED BOOKINGS (Admin Only)
// ==========================================
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot delete your own admin account." });
        }

        // Delete user & clean up bookings
        await Booking.deleteMany({ user: user._id });
        await User.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "User and associated reservations permanently removed.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete user." });
    }
};