// backend/models/ResourceAssignment.js
import mongoose from "mongoose";

const resourceAssignmentSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Ensure one assignment per resource-student pair
resourceAssignmentSchema.index({ resource: 1, student: 1 }, { unique: true });

// Indexes for efficient querying
resourceAssignmentSchema.index({ student: 1, createdAt: -1 });
resourceAssignmentSchema.index({ teacher: 1, createdAt: -1 });
resourceAssignmentSchema.index({ resource: 1 });

const ResourceAssignment = mongoose.model("ResourceAssignment", resourceAssignmentSchema);

export default ResourceAssignment;

