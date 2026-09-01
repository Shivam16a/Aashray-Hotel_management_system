const nodemailer = require("nodemailer");

const sendEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Email Verification OTP",
        html: `
      <h2>Your OTP is: ${otp}</h2>
      <p>Valid for 5 minutes</p>
    `,
    });
};

module.exports = sendEmail;