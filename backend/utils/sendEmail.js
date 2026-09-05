// backend/utils/sendEmail.js
const axios = require("axios");

const sendEmail = async (email, otp) => {
    const senderEmail = process.env.SENDER_EMAIL || process.env.EMAIL;
    const apiKey = process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.trim() : null;

    if (!apiKey) {
        console.error("❌ CRITICAL: BREVO_API_KEY is missing in environment variables!");
        throw new Error("Server configuration error: Email API key missing");
    }

    if (!senderEmail) {
        console.error("❌ CRITICAL: SENDER_EMAIL is missing in environment variables!");
        throw new Error("Server configuration error: Sender email missing");
    }

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
                                <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">Account <span style="color: #00f0ff;">Security</span></span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 32px 28px; text-align: center;">
                                <h2 style="margin: 0 0 8px; color: #ffffff; font-size: 20px;">Email Verification Code</h2>
                                <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px;">Use this one-time security pass to authorize your action.</p>
                                
                                <div style="display: inline-block; background-color: rgba(0, 240, 255, 0.08); border: 1px dashed #00f0ff; border-radius: 12px; padding: 14px 36px; margin-bottom: 24px;">
                                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #00f0ff; font-family: monospace;">${otp}</span>
                                </div>
                                
                                <p style="margin: 0; color: #64748b; font-size: 12px; line-height: 1.5;">This OTP is valid strictly for <strong>5 minutes</strong>. If you did not request this verification, please disregard this email.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px; background-color: #080c18; border-top: 1px solid #1e293b; text-align: center;">
                                <p style="margin: 0; color: #475569; font-size: 11px;">© 2026 Aashray Hospitality Network. Automated Service Notification.</p>
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
        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "Aashray Verification",
                    email: senderEmail.trim()
                },
                to: [{ email: email.trim() }],
                subject: "Aashray Email Verification OTP",
                htmlContent: otpHtml,
            },
            {
                headers: {
                    "api-key": apiKey,
                    "Content-Type": "application/json",
                    "accept": "application/json"
                },
            }
        );

        console.log("✅ Brevo OTP Sent Successfully! MessageId:", response.data?.messageId);
        return response.data;
    } catch (error) {
        console.error("❌ Brevo OTP Send Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to dispatch verification OTP");
    }
};

module.exports = sendEmail;