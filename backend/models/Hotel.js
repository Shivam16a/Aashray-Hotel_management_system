// backend/models/Hotel.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        username: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
    }
);

const hotelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        location: { type: String, required: true, trim: true, index: true },
        city: { type: String, required: true, lowercase: true, trim: true, index: true },
        pricePerNight: { type: Number, required: true, min: 0 },
        originalPrice: { type: Number, default: 0 },
        rating: { type: Number, default: 4.5, min: 1, max: 5 },
        reviewsCount: { type: Number, default: 0 },
        reviews: [reviewSchema],
        tag: { type: String, default: "Verified Stay" },
        images: [{ type: String, required: true }],
        amenities: [{ type: String }],
        availableRooms: { type: Number, required: true, default: 10 },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Hotel", hotelSchema);