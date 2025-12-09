// backend/models/PracticeSession.js
import mongoose from "mongoose";

const practiceSessionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    minutes: {
      type: Number,
      required: true,
    },
    focus: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    // Track when the practice session actually started and ended
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

const PracticeSession = mongoose.model("PracticeSession", practiceSessionSchema);

export default PracticeSession;

