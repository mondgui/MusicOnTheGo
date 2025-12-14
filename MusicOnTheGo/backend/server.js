// backend/server.js
import dotenv from "dotenv";
dotenv.config(); // Load environment variables FIRST, before any other imports

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js"; // 
import authRoutes from "./routes/authRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import practiceRoutes from "./routes/practiceRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/community", communityRoutes);





// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

// Basic route
app.get("/", (req, res) => {
  res.send("Welcome to MusicOnTheGo Backend API!");
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start the server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
