// backend/routes/bookingRoutes.js
import express from "express";
import Booking from "../models/Booking.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * STUDENT: Create a booking request
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const { teacher, day, timeSlot } = req.body;

      if (!teacher || !day || !timeSlot) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      const booking = new Booking({
        student: req.user.id,
        teacher,
        day,
        timeSlot,
      });

      await booking.save();

      res.status(201).json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * TEACHER: Approve or reject booking
 */
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const booking = await Booking.findById(req.params.id);

      if (!booking) return res.status(404).json({ message: "Booking not found." });

      // Ensure only the correct teacher can update
      if (booking.teacher.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized teacher." });
      }

      booking.status = status;
      await booking.save();

      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * STUDENT: View their own bookings
 */
router.get(
  "/student/me",
  authMiddleware,
  roleMiddleware("student"),
  async (req, res) => {
    try {
      const bookings = await Booking.find({ student: req.user.id })
        .populate("teacher", "name email");
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * TEACHER: View bookings for them
 */
router.get(
  "/teacher/me",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const bookings = await Booking.find({ teacher: req.user.id })
        .populate("student", "name email");
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);


// DELETE a booking by ID (for testing or admin use)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Optional: Only allow the teacher or student involved to delete
    const isOwner =
      req.user.id === booking.teacher.toString() ||
      req.user.id === booking.student.toString();

    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this booking." });
    }

    await booking.deleteOne();

    res.json({ message: "Booking deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default router;
