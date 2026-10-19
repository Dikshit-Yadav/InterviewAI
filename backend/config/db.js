import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to MongoDB");
};

export default connectDB;