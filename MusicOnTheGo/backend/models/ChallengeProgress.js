// backend/models/ChallengeProgress.js
import mongoose from "mongoose";

const challengeProgressSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Progress percentage (0-100)
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Current value based on challenge requirements
    currentValue: {
      type: Number,
      default: 0,
    },
    // Whether the challenge is completed
    completed: {
      type: Boolean,
      default: false,
    },
    // When the challenge was completed
    completedAt: {
      type: Date,
    },
    // Last updated timestamp for progress tracking
    lastProgressUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure a student can only have one progress entry per challenge
challengeProgressSchema.index({ challenge: 1, student: 1 }, { unique: true });

// Index for efficient querying
challengeProgressSchema.index({ student: 1, completed: 1 });
challengeProgressSchema.index({ challenge: 1 });

const ChallengeProgress = mongoose.model("ChallengeProgress", challengeProgressSchema);

export default ChallengeProgress;

