// backend/routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const { getAdminContacts, broadcastToAllAdmins } = require("../controllers/contactController");

router.get("/admins", getAdminContacts);
router.post("/broadcast", broadcastToAllAdmins);

module.exports = router;