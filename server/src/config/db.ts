import mongoose from "mongoose";
import "dotenv/config";
import logger from "../lib/logger.ts";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    await mongoose.connect(mongoUri);
    logger.info("💽 MongoDB Connected!");
  } catch (err) {
    logger.error(
      "Database connection error:",
      err instanceof Error ? err.message : err
    );
    process.exit(1);
  }
};

export default connectDB;
