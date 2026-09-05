// backend/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
    const emailUser = process.env.EMAIL_USER || process.env.EMAIL;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
        console.error("❌ CRITICAL: EMAIL_USER or EMAIL_PASS missing in .env!");
        throw new Error("Server configuration error: Email credentials missing");
    }

    // Gmail SMTP Transporter with Port 587 (Render-friendly)
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // TLS upgrade
        auth: {
            user: emailUser.trim(),
            pass: emailPass.replace(/\s+/g, ""), // Removes spaces
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const otpHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #060913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 35px 15px;">
            <tr>
                <td align="center">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #0d1322; border-radius: 14px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                        <tr>
                            <td style="padding: 24px 28px; border-bottom: 1px solid #1e293b; text-align: center;">
                                <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">Aashray <span style="color: #00f0ff;">Security</span></span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 32px 28px; text-align: center;">
                                <h2 style="margin: 0 0 8px; color: #ffffff; font-size: 20px;">Email Verification Code</h2>
                                <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px;">Use this one-time security pass to complete your registration.</p>
                                
                                <div style="display: inline-block; background-color: rgba(0, 240, 255, 0.08); border: 1px dashed #00f0ff; border-radius: 12px; padding: 14px 36px; margin-bottom: 24px;">
                                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #00f0ff; font-family: monospace;">${otp}</span>
                                </div>
                                
                                <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">This OTP is valid strictly for <strong>5 minutes</strong>. If you did not request this verification, please disregard this email.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px; background-color: #080c18; border-top: 1px solid #1e293b; text-align: center;">
                                <p style="margin: 0; color: #475569; font-size: 11px;">© 2026 Aashray Hospitality Network. Automated Security Notification.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    try {
        const info = await transporter.sendMail({
            from: `"Aashray Portal" <${emailUser.trim()}>`,
            to: email.trim(),
            subject: "Your Email Verification OTP - Aashray",
            html: otpHtml,
        });

        console.log("✅ OTP Sent via Gmail SMTP to:", email, "MessageId:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Gmail SMTP Error:", error.message);
        throw new Error("Failed to dispatch verification OTP: " + error.message);
    }
};

module.exports = sendEmail;