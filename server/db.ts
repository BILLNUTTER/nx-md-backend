import mongoose from "mongoose";
import Settings from "./models/Settings";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const settings = await Settings.findOne();
    if (!settings) {
      await Settings.create({
        subscriptionPrice: 70,
        subscriptionDays: 30,
        maintenanceMode: false,
      });
      console.log("Default settings created");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
