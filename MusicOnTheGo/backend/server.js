// backend/server.js
import dotenv from "dotenv";
dotenv.config(); // Load environment variables FIRST, before any other imports

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import userRoutes from "./routes/userRoutes.js"; // 
import authRoutes from "./routes/authRoutes.js";
import availabilityRoutes, { setSocketIO as setAvailabilitySocketIO } from "./routes/availabilityRoutes.js";
import bookingRoutes, { setSocketIO as setBookingSocketIO } from "./routes/bookingRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import practiceRoutes from "./routes/practiceRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import Message from "./models/Message.js";

const app = express();
const httpServer = createServer(app);

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
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);

// Debug: Log all registered routes
console.log("✅ Review routes registered at /api/reviews");





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

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, specify your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Pass io instance to routes that need it
setBookingSocketIO(io);
setAvailabilitySocketIO(io);

// Socket.io authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach user info to socket
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.io connection handling
io.on("connection", (socket) => {
  // Join user's personal room for notifications
  socket.join(`user:${socket.user.id}`);

  // Handle joining a chat room
  socket.on("join-chat", (otherUserId) => {
    if (!otherUserId) return;
    
    const roomId = [socket.user.id, otherUserId].sort().join("-");
    socket.join(`chat:${roomId}`);
    console.log(`📱 User ${socket.user.id} joined chat room: ${roomId}`);
  });

  // Handle leaving a chat room
  socket.on("leave-chat", (otherUserId) => {
    if (!otherUserId) return;
    
    const roomId = [socket.user.id, otherUserId].sort().join("-");
    socket.leave(`chat:${roomId}`);
    console.log(`📱 User ${socket.user.id} left chat room: ${roomId}`);
  });

  // Handle sending a message
  socket.on("send-message", async (data) => {
    try {
      const { recipientId, text } = data;

      if (!recipientId || !text || !text.trim()) {
        socket.emit("error", { message: "Recipient ID and message text are required" });
        return;
      }

      // Save message to database
      const message = await Message.create({
        sender: socket.user.id,
        recipient: recipientId,
        text: text.trim(),
        read: false,
      });

      // Populate sender and recipient info
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name profileImage role")
        .populate("recipient", "name profileImage role");

      // Emit to both users in the chat room
      const roomId = [socket.user.id, recipientId].sort().join("-");
      io.to(`chat:${roomId}`).emit("new-message", populatedMessage);

      // Also emit to recipient's personal room for notifications
      io.to(`user:${recipientId}`).emit("message-notification", {
        message: populatedMessage,
        unreadCount: await Message.countDocuments({
          recipient: recipientId,
          read: false,
        }),
      });

      console.log(`💬 Message sent from ${socket.user.id} to ${recipientId}`);
    } catch (error) {
      console.error("❌ Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { recipientId, isTyping } = data;
    if (!recipientId) return;

    const roomId = [socket.user.id, recipientId].sort().join("-");
    socket.to(`chat:${roomId}`).emit("user-typing", {
      userId: socket.user.id,
      isTyping,
    });
  });

  // Handle marking messages as read
  socket.on("mark-read", async (data) => {
    try {
      const { senderId } = data;
      if (!senderId) return;

      // Mark all messages from this sender as read
      await Message.updateMany(
        {
          sender: senderId,
          recipient: socket.user.id,
          read: false,
        },
        {
          read: true,
          readAt: new Date(),
        }
      );

      // Notify sender that messages were read
      io.to(`user:${senderId}`).emit("messages-read", {
        recipientId: socket.user.id,
      });

      console.log(`✅ Messages marked as read: ${senderId} -> ${socket.user.id}`);
    } catch (error) {
      console.error("❌ Error marking messages as read:", error);
    }
  });

  // Handle joining teacher availability room
  // - Teachers can join their own room (no argument)
  // - Students/viewers can join a specific teacher's room by passing teacherId
  socket.on("join-teacher-availability", (teacherId) => {
    const targetTeacherId = teacherId || socket.user.id;
    socket.join(`teacher-availability:${targetTeacherId}`);
  });

  // Handle leaving teacher availability room
  socket.on("leave-teacher-availability", (teacherId) => {
    const targetTeacherId = teacherId || socket.user.id;
    socket.leave(`teacher-availability:${targetTeacherId}`);
  });

  // Handle joining teacher bookings room
  socket.on("join-teacher-bookings", () => {
    socket.join(`teacher-bookings:${socket.user.id}`);
  });

  // Handle leaving teacher bookings room
  socket.on("leave-teacher-bookings", () => {
    socket.leave(`teacher-bookings:${socket.user.id}`);
  });

  // Handle joining student bookings room
  socket.on("join-student-bookings", () => {
    socket.join(`student-bookings:${socket.user.id}`);
  });

  // Handle leaving student bookings room
  socket.on("leave-student-bookings", () => {
    socket.leave(`student-bookings:${socket.user.id}`);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // User disconnected
  });
});

// Export io instance for use in routes
export { io };

// 404 handler for undefined routes
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: `Route not found: ${req.method} ${req.path}`,
    availableRoutes: [
      "POST /api/reviews",
      "GET /api/reviews/teacher/:teacherId",
      "GET /api/reviews/teacher/:teacherId/me",
      "PUT /api/reviews/:id",
      "DELETE /api/reviews/:id"
    ]
  });
});

// Start the server
const PORT = process.env.PORT || 5050;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
  console.log(`📝 Review routes available at /api/reviews`);
});
