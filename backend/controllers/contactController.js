// backend/controllers/contactController.js
const User = require("../models/users");
const sendEmail = require("../utils/sendEmail");

// ==========================================
// GET ALL ACTIVE ADMIN CONTACTS (PUBLIC)
// ==========================================
exports.getAdminContacts = async (req, res) => {
    try {
        const admins = await User.find({ role: "Admin", isBlocked: false })
            .select("username email phone role");

        return res.status(200).json({
            success: true,
            admins: admins || [],
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch support contacts.",
        });
    }
};

// ==========================================
// BROADCAST INQUIRY TO ALL ADMINS
// ==========================================
exports.broadcastToAllAdmins = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields (Name, Email, Message).",
            });
        }

        // 1. Fetch all active Admin emails
        const admins = await User.find({ role: "Admin", isBlocked: false }).select("email phone username");

        if (!admins || admins.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active support administrators available right now.",
            });
        }

        const adminEmails = admins.map((adm) => adm.email);

        // 2. Prepare structured HTML notification template
        const emailContent = `
            <div style="font-family: Arial, sans-serif; background-color: #060913; color: #ffffff; padding: 25px; border-radius: 10px; border: 1px solid #00f0ff;">
                <h2 style="color: #00f0ff; margin-bottom: 5px;">⚡ New Guest Inquiry Alert</h2>
                <p style="color: #94a3b8; font-size: 13px;">A traveler submitted an urgent request on the Aashray Portal:</p>
                
                <div style="background-color: #0d1322; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p><strong>Traveler Name:</strong> ${name}</p>
                    <p><strong>Contact Email:</strong> <a href="mailto:${email}" style="color: #00f0ff;">${email}</a></p>
                    <p><strong>Phone Number:</strong> ${phone || "Not provided"}</p>
                    <p><strong>Inquiry / Message:</strong></p>
                    <blockquote style="border-left: 3px solid #00f0ff; padding-left: 12px; color: #e2e8f0; margin: 5px 0;">
                        ${message}
                    </blockquote>
                </div>

                <p style="font-size: 12px; color: #64748b;">This notification was dispatched simultaneously to all platform administrators.</p>
            </div>
        `;

        // 3. Dispatch emails simultaneously to all admins
        const emailPromises = adminEmails.map((adminEmail) =>
            sendEmail({
                to: adminEmail,
                subject: `[Aashray Support Alert] New Inquiry from ${name}`,
                html: emailContent,
            }).catch((err) => console.error(`Failed sending to ${adminEmail}:`, err.message))
        );

        await Promise.all(emailPromises);

        return res.status(200).json({
            success: true,
            message: `Your message has been broadcasted to all ${admins.length} platform administrators!`,
            adminsCount: admins.length,
            primaryAdminPhone: admins[0]?.phone || "918002632535",
        });
    } catch (error) {
        console.error("BROADCAST_ADMIN_ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to broadcast message to administrators.",
        });
    }
};