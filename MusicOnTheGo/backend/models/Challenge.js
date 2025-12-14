// backend/models/Challenge.js
import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    reward: {
      type: String,
      default: "",
    },
    // Challenge requirements (e.g., "Practice 30 days", "Complete 10 sessions", "Master a song")
    requirements: {
      type: {
        type: String, // "practice_days" | "practice_sessions" | "recording" | "manual"
        enum: ["practice_days", "practice_sessions", "recording", "manual"],
        required: true,
      },
      target: {
        type: Number, // e.g., 30 days, 10 sessions
        required: true,
      },
      description: {
        type: String, // Human-readable description
        required: true,
      },
    },
    // Who created this challenge (teacher)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Instrument this challenge is for
    instrument: {
      type: String,
      required: true,
    },
    // Optional category tag
    category: {
      type: String,
      default: "",
    },
    // Challenge status
    status: {
      type: String,
      enum: ["draft", "active", "completed", "cancelled"],
      default: "draft",
    },
    // Students who joined this challenge
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    // Visibility: "public" (any student can join) or "private" (only assigned students)
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    // For private challenges, list of assigned student IDs
    assignedStudents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
challengeSchema.index({ createdBy: 1, status: 1 });
challengeSchema.index({ instrument: 1, difficulty: 1, status: 1 });
challengeSchema.index({ participants: 1 });

const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge;

