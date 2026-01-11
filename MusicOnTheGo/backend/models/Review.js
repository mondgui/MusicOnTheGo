// backend/models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    // Optional: Associate review with a specific booking/lesson
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },
  },
  { timestamps: true }
);

// Ensure a student can only leave one review per teacher (but can update it)
reviewSchema.index({ teacher: 1, student: 1 }, { unique: true });

// Indexes for efficient querying
reviewSchema.index({ teacher: 1, createdAt: -1 });
reviewSchema.index({ student: 1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
