// backend/routes/reviewRoutes.js
import express from "express";
import Review from "../models/Review.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Debug: Test route to verify router is working
router.get("/test", (req, res) => {
  res.json({ message: "Review routes are working!", timestamp: new Date().toISOString() });
});

// Helper function to update teacher's average rating and review count
async function updateTeacherRating(teacherId) {
  const reviews = await Review.find({ teacher: teacherId });
  
  if (reviews.length === 0) {
    await User.findByIdAndUpdate(teacherId, {
      averageRating: null,
      reviewCount: 0,
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  const reviewCount = reviews.length;

  await User.findByIdAndUpdate(teacherId, {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    reviewCount,
  });
}

/**
 * STUDENT: Create or update a review for a teacher
 * Students can only review teachers they have bookings with
 */
router.post("/", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    console.log("[Reviews] POST /api/reviews - Received request:", {
      body: req.body,
      userId: req.user?.id,
      userRole: req.user?.role,
    });
    const { teacherId, rating, comment, bookingId } = req.body;

    if (!teacherId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: "Teacher ID and rating (1-5) are required." 
      });
    }

    // Verify that the student has at least one booking with this teacher
    const booking = await Booking.findOne({
      teacher: teacherId,
      student: req.user.id,
      status: "approved",
    });

    if (!booking) {
      return res.status(403).json({ 
        message: "You can only review teachers you have booked lessons with." 
      });
    }

    // Check if review already exists (to allow updates)
    let review = await Review.findOne({
      teacher: teacherId,
      student: req.user.id,
    });

    let isNewReview = false;

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment || "";
      if (bookingId) review.booking = bookingId;
      await review.save();
    } else {
      // Create new review
      isNewReview = true;
      review = await Review.create({
        teacher: teacherId,
        student: req.user.id,
        rating,
        comment: comment || "",
        booking: bookingId || booking._id,
      });
    }

    // Update teacher's average rating
    await updateTeacherRating(teacherId);

    // Populate student info for response
    await review.populate("student", "name profileImage");

    res.status(isNewReview ? 201 : 200).json(review);
  } catch (err) {
    console.error("[Reviews] Error in POST /api/reviews:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this teacher." });
    }
    res.status(500).json({ message: err.message });
  }
});

/**
 * Get all reviews for a specific teacher
 */
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ teacher: teacherId })
      .populate("student", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Review.countDocuments({ teacher: teacherId });

    res.json({
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasMore: skip + reviews.length < totalCount,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * STUDENT: Get their own review for a specific teacher
 */
router.get("/teacher/:teacherId/me", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const { teacherId } = req.params;

    const review = await Review.findOne({
      teacher: teacherId,
      student: req.user.id,
    }).populate("student", "name profileImage");

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * STUDENT: Update their own review
 */
router.put("/:id", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (review.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5." });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Update teacher's average rating
    await updateTeacherRating(review.teacher);

    await review.populate("student", "name profileImage");

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * STUDENT: Delete their own review
 */
router.delete("/:id", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (review.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    const teacherId = review.teacher;

    await Review.findByIdAndDelete(req.params.id);

    // Update teacher's average rating
    await updateTeacherRating(teacherId);

    res.json({ message: "Review deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
