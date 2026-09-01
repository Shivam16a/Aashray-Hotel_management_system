// backend/controllers/aiController.js
const axios = require("axios");
const Hotel = require("../models/Hotel");

// =========================================================================
// SYSTEM PROMPT & BOUNDARY RULES FOR AASHRAY CONCIERGE
// =========================================================================
const SYSTEM_INSTRUCTION = `
You are "Aashray AI Concierge", an authentic, polite, and witty AI assistant dedicated to "Aashray" luxury villa & sanctuary booking network in India.

RULES & CAPABILITIES:
1. NATURAL HUMAN CONVERSATION: If the user greets you ("hi", "hello", "how are you", "kaisa hai"), reply naturally and warmly like a helpful host before asking about their stay plans.
2. AFFORDABLE & DESTINATION QUERIES: If the user asks for budget/affordable stays or specific cities (Goa, Manali, Jaipur, Udaipur, Delhi), analyze the live properties list below and give direct recommendations with exact prices.
3. DOMAIN GUARDRAIL: Only decline if the user asks something completely outside travel, portal bookings, or stays (e.g. coding/Python/JS, math formulas, politics, movie trivia).
4. MULTI-LINGUAL: Respond in the language of the inquiry (English, Hindi, or Hinglish).
`;

// Helper: Escape special regex characters
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Helper: Intelligent Fallback Rule Engine (Improved)
function getIntelligentFallbackResponse(query, liveHotels) {
    const q = query.toLowerCase().trim();

    // 1. Casual Pleasantries & Greetings
    if (q.includes("how are you") || q.includes("kaisa hai") || q.includes("kaise ho") || q.includes("whats up")) {
        return "I am doing wonderful and ready to help you plan an unforgettable getaway! Are you looking for a beachfront villa in Goa, a serene mountain chalet in Manali, or a heritage stay in Rajasthan?";
    }

    if (q === "hi" || q === "hello" || q === "hey" || q.startsWith("hi ") || q.startsWith("hello ")) {
        return "Hello! Welcome to Aashray Stays. How can I help you find your dream sanctuary today?";
    }

    // 2. Out-of-scope Check
    const outOfScopePatterns = [
        "javascript", "js", "python", "java", "c++", "cpp", "c#", "html", "css", "code", "coding", "programming",
        "react", "node", "function", "variable", "algorithm", "who is the prime minister", "who is the president",
        "capital of", "recipe", "math", "calculus", "science", "physics", "chemistry", "sports", "cricket"
    ];

    const isOutOfScope = outOfScopePatterns.some(term => {
        const escaped = escapeRegex(term);
        return new RegExp(`(^|\\W)${escaped}(\\W|$)`, 'i').test(q);
    });

    if (isOutOfScope && !q.includes("aashray") && !q.includes("hotel") && !q.includes("villa") && !q.includes("stay") && !q.includes("book")) {
        return "I am the dedicated Aashray AI Concierge. Please ask queries related only to the Aashray portal, luxury villa & hotel booking processes, property amenities, or stay policies.";
    }

    // 3. Affordable / Budget Stays Inquiry
    if (q.includes("affordable") || q.includes("sasta") || q.includes("budget") || q.includes("cheap") || q.includes("low price")) {
        const sortedStays = [...(liveHotels || [])].sort((a, b) => a.pricePerNight - b.pricePerNight);
        const topAffordable = sortedStays.slice(0, 3).map(h => `• **${h.name}** in ${h.location} — ₹${h.pricePerNight}/night`).join("\n");

        return `To book an affordable sanctuary on Aashray:\n\n1. Go to **Explore Stays** and check our budget-friendly options:\n${topAffordable || "• Check properties in Manali & Jaipur starting around ₹2,500/night"}\n\n2. Click on the property, pick your check-in dates, and use Razorpay UPI for instant zero-surcharge booking!`;
    }

    // 4. Booking Process Query
    if (q.includes("process") || q.includes("how to book") || q.includes("booking steps")) {
        return `Here is the seamless 4-step process for booking a stay on Aashray:

1. 🔍 **Search & Discover:** Go to the **Discover Dashboard** and filter by destination (Goa, Manali, Jaipur, Udaipur, Delhi).
2. 🏷️ **Explore Details:** Click any property card to view HD photos, verified amenities, and reviews.
3. 📅 **Reserve Your Stay:** Click **"Book Now"**, select check-in/out dates, and select guest count.
4. 🎟️ **Instant Pass:** Confirm payment via Razorpay to immediately receive your digital checkout pass in **"My Bookings"** and in your email.`;
    }

    // 5. Cancellation & Refund
    if (q.includes("cancel") || q.includes("refund")) {
        return "At Aashray, most verified sanctuaries offer **Free Cancellation up to 24 hours prior to check-in**. Once cancelled, refunds are processed instantly back to your original payment method.";
    }

    // 6. Available Villas / Stays
    if (q.includes("villa") || q.includes("hotels") || q.includes("properties") || q.includes("goa") || q.includes("delhi") || q.includes("manali") || q.includes("jaipur") || q.includes("udaipur")) {
        const hotelNames = (liveHotels || []).map(h => `• **${h.name}** (${h.location}) — ₹${h.pricePerNight}/night`).join("\n");
        return `Here are some of the active luxury sanctuaries currently available on Aashray:\n\n${hotelNames || "Check out our Discover page for all available retreats!"}\n\nYou can click on any of them on your Dashboard to lock in your dates!`;
    }

    // Default Fallback
    return "I am here to assist you with finding luxury villas, checking live prices, understanding our 24-hour cancellation policy, or guiding your booking on Aashray. Which destination are you exploring?";
}

// =========================================================================
// AI CHAT ENDPOINT
// =========================================================================
exports.chatWithAssistant = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid question."
            });
        }

        const liveHotels = await Hotel.find().select("name location city pricePerNight rating amenities").limit(10);

        // Gemini API Check
        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey && geminiKey.trim().length > 10) {
            try {
                const prompt = `${SYSTEM_INSTRUCTION}

CURRENT LIVE PROPERTIES ON AASHRAY PORTAL:
${JSON.stringify(liveHotels, null, 2)}

USER INQUIRY: "${message}"

RESPONSE:`;

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;
                const response = await axios.post(
                    geminiUrl,
                    { contents: [{ parts: [{ text: prompt }] }] },
                    { headers: { "Content-Type": "application/json" }, timeout: 9000 }
                );

                const aiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (aiReply) {
                    return res.status(200).json({
                        success: true,
                        reply: aiReply.trim()
                    });
                }
            } catch (apiErr) {
                console.error("⚠️ [GEMINI API CALL FAILED]:", apiErr.response?.data?.error?.message || apiErr.message);
            }
        } else {
            console.warn("⚠️ [GEMINI_API_KEY MISSING OR SHORT IN .env]");
        }

        // Intelligent Deterministic Fallback Engine
        const fallbackReply = getIntelligentFallbackResponse(message, liveHotels);
        return res.status(200).json({
            success: true,
            reply: fallbackReply
        });

    } catch (error) {
        console.error("AI_ASSISTANT_ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "I am the dedicated Aashray AI Concierge. Please ask queries related only to the Aashray portal or villa booking processes."
        });
    }
};