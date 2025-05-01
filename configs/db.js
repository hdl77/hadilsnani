import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected")
    );
    await mongoose.connect(process.env.MONGODB_URL);
  } catch (error) {
    console.error("Database connection error:", error); // More specific error message
    process.exit(1);
  }
};
export default connectDB;
