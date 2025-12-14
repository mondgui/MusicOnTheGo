// backend/models/Resource.js
import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    // File URL (for uploaded files like PDFs, images)
    fileUrl: {
      type: String,
      default: "",
    },
    // External URL (for links to videos, external resources)
    externalUrl: {
      type: String,
      default: "",
    },
    // File type: "pdf" | "image" | "audio" | "video" | "link"
    fileType: {
      type: String,
      enum: ["pdf", "image", "audio", "video", "link"],
      required: true,
    },
    // File size in bytes (for uploaded files)
    fileSize: {
      type: Number,
      default: 0,
    },
    // Instrument this resource is for
    instrument: {
      type: String,
      required: true,
    },
    // Level: "Beginner" | "Intermediate" | "Advanced"
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    // Optional category tag (e.g., "Theory", "Technique", "Songs", "Exercises")
    category: {
      type: String,
      default: "",
    },
    // Who uploaded this resource
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Students this resource is assigned to
    assignedTo: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
resourceSchema.index({ instrument: 1, level: 1 });
resourceSchema.index({ uploadedBy: 1 });
resourceSchema.index({ category: 1 });
resourceSchema.index({ assignedTo: 1 });

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;

