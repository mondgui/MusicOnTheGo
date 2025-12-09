// backend/models/Recording.js
import mongoose from "mongoose";

const recordingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional, can be assigned later
    },
    title: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    studentNotes: {
      type: String,
      default: "",
    },
    teacherFeedback: {
      type: String,
      default: "",
    },
    hasTeacherFeedback: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Recording = mongoose.model("Recording", recordingSchema);

export default Recording;

