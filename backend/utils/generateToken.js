// utils/generateToken.js
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || "aashray_jwt_super_secure_fallback_key_2026";
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

    return jwt.sign({ id: id.toString() }, secret, {
        expiresIn: expiresIn,
    });
};

module.exports = generateToken;