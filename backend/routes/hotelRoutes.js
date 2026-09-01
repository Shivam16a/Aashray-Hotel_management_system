// backend/routes/hotelRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    getAllHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
    getAdminStats,
} = require("../controllers/hotelController");
const { addHotelReview } = require("../controllers/hotelController");

// Public routes
router.get("/", getAllHotels);
router.get("/stats/overview", protect, authorize("Admin", "Owner"), getAdminStats);
router.get("/:id", getHotelById);

// Protected Admin / Owner routes
router.post("/", protect, authorize("Admin", "Owner"), createHotel);
router.put("/:id", protect, authorize("Admin", "Owner"), updateHotel);
router.delete("/:id", protect, authorize("Admin", "Owner"), deleteHotel);
router.post("/:id/reviews", protect, addHotelReview);

module.exports = router;