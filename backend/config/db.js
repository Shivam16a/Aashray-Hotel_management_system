const mongodb = require("mongoose");

const connectDb = async () => {
    try {
        await mongodb.connect(process.env.MONGO_URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection failed", error);
        process.exit(0);
    }
};

module.exports = connectDb;