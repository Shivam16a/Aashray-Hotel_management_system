// backend/controllers/hotelController.js
const Hotel = require("../models/Hotel");
const Booking = require("../models/Booking");

// ==========================================
// GET ALL HOTELS
// ==========================================
exports.getAllHotels = async (req, res) => {
    try {
        const { search, city } = req.query;
        let filter = {};

        // Helper: Escape special regex characters to prevent regex injection crashes
        const escapeRegex = (text) => {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        };

        const searchKeyword = (search || city || "").trim();

        if (searchKeyword.length > 0) {
            const safePattern = new RegExp(escapeRegex(searchKeyword), "i");
            filter = {
                $or: [
                    { name: safePattern },
                    { location: safePattern },
                    { city: safePattern },
                    { description: safePattern }
                ]
            };
        }

        const hotels = await Hotel.find(filter).sort({ rating: -1 });

        return res.status(200).json({
            success: true,
            count: hotels.length,
            hotels: hotels || [],
        });
    } catch (error) {
        console.error("GET_HOTELS_CRITICAL_ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch hotels",
            error: error.message,
        });
    }
};

// ==========================================
// GET SINGLE HOTEL BY ID
// ==========================================
exports.getHotelById = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id).populate(
            "owner",
            "username email phone role isVerified"
        );

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: "Hotel not found",
            });
        }

        return res.status(200).json({
            success: true,
            hotel,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch hotel details",
        });
    }
};

// ==========================================
// CREATE NEW HOTEL (Admin / Owner Only)
// ==========================================
exports.createHotel = async (req, res) => {
    try {
        const { name, description, location, city, pricePerNight, originalPrice, tag, images, amenities, availableRooms } = req.body;

        if (!name || !description || !location || !city || !pricePerNight) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields (name, description, location, city, pricePerNight).",
            });
        }

        const newHotel = await Hotel.create({
            name,
            description,
            location,
            city: city.toLowerCase().trim(),
            pricePerNight: Number(pricePerNight),
            originalPrice: Number(originalPrice) || Number(pricePerNight),
            tag: tag || "Verified Stay",
            images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"],
            amenities: Array.isArray(amenities) ? amenities : amenities.split(",").map((a) => a.trim()),
            availableRooms: Number(availableRooms) || 5,
            owner: req.user._id,
        });

        return res.status(201).json({
            success: true,
            message: "Property listed successfully!",
            hotel: newHotel,
        });
    } catch (error) {
        console.error("CREATE_HOTEL_ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to create hotel listing." });
    }
};

// ==========================================
// UPDATE HOTEL (Admin or Listing Owner)
// ==========================================
exports.updateHotel = async (req, res) => {
    try {
        let hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            return res.status(404).json({ success: false, message: "Property not found." });
        }

        // Only Admin or Owner of this listing can edit
        if (req.user.role !== "Admin" && hotel.owner && hotel.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this listing." });
        }

        if (req.body.city) req.body.city = req.body.city.toLowerCase().trim();
        if (typeof req.body.amenities === "string") {
            req.body.amenities = req.body.amenities.split(",").map((a) => a.trim());
        }

        hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        return res.status(200).json({
            success: true,
            message: "Property updated successfully.",
            hotel,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update property." });
    }
};

// ==========================================
// DELETE HOTEL
// ==========================================
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            return res.status(404).json({ success: false, message: "Property not found." });
        }

        if (req.user.role !== "Admin" && hotel.owner && hotel.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete this listing." });
        }

        await Hotel.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Property removed successfully.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete property." });
    }
};

// ==========================================
// ADMIN / OWNER ANALYTICS STATS
// ==========================================
exports.getAdminStats = async (req, res) => {
    try {
        const totalHotels = await Hotel.countDocuments();
        const Booking = require("../models/Booking");
        const totalBookings = await Booking.countDocuments();
        const bookings = await Booking.find({ status: "Confirmed" });
        const totalRevenue = bookings.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

        return res.status(200).json({
            success: true,
            stats: {
                totalHotels,
                totalBookings,
                totalRevenue,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch stats." });
    }
};

// ==========================================
// ADD HOTEL REVIEW (SECURED: CHECKED-OUT GUESTS ONLY)
// ==========================================
exports.addHotelReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const hotelId = req.params.id;
        const userId = req.user._id;

        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: "Rating and comment are required." });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found." });
        }

        // 🛡️ SECURITY CHECK 1: User ne yeh hotel book kiya tha aur status 'Checked-Out' hai?
        const completedStay = await Booking.findOne({
            user: userId,
            hotel: hotelId,
            status: "Checked-Out",
        });

        if (!completedStay) {
            return res.status(403).json({
                success: false,
                message: "Access Denied: You can only review a sanctuary after your stay is officially completed & checked out.",
            });
        }

        // 🛡️ SECURITY CHECK 2: User pehle hi is hotel par review de chuka hai?
        const alreadyReviewed = hotel.reviews.find(
            (r) => r.user.toString() === userId.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted a review for this sanctuary.",
            });
        }

        const newReview = {
            user: userId,
            username: req.user.username || "Verified Traveler",
            rating: Number(rating),
            comment: comment.trim(),
            createdAt: new Date(),
        };

        hotel.reviews.unshift(newReview);
        hotel.reviewsCount = hotel.reviews.length;

        // Auto-recalculate average rating
        const totalRating = hotel.reviews.reduce((acc, item) => item.rating + acc, 0);
        hotel.rating = Number((totalRating / hotel.reviews.length).toFixed(1));

        await hotel.save();

        return res.status(201).json({
            success: true,
            message: "Verified review published successfully!",
            hotel,
        });
    } catch (error) {
        console.error("ADD_REVIEW_ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to post review." });
    }
};