// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    getAllUsers,
    updateUser,
    toggleBlockUser,
    deleteUser,
} = require("../controllers/adminController");

// All routes require logged in Admin
router.use(protect, authorize("Admin"));

router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.patch("/users/:id/block", toggleBlockUser);
router.delete("/users/:id", deleteUser);

module.exports = router;