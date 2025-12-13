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

      // Check if there's already an approved booking for this time slot
      const existingApproved = await Booking.findOne({
        teacher,
        day,
        "timeSlot.start": timeSlot.start,
        "timeSlot.end": timeSlot.end,
        status: "approved",
      });

      if (existingApproved) {
        return res.status(409).json({ 
          message: "This time slot is already booked by another student." 
        });
      }

      // Check if the same student already has a pending or approved booking for this time slot
      const existingStudentBooking = await Booking.findOne({
        student: req.user.id,
        teacher,
        day,
        "timeSlot.start": timeSlot.start,
        "timeSlot.end": timeSlot.end,
        status: { $in: ["pending", "approved"] },
      });

      if (existingStudentBooking) {
        return res.status(409).json({ 
          message: "You already have a booking request for this time slot." 
        });
      }

      // Check if another student has a pending booking for this time slot
      const existingPending = await Booking.findOne({
        teacher,
        day,
        "timeSlot.start": timeSlot.start,
        "timeSlot.end": timeSlot.end,
        status: "pending",
      });

      if (existingPending) {
        // Allow the booking but note that there's a conflict
        // The teacher will see multiple pending requests and can choose
        const booking = new Booking({
          student: req.user.id,
          teacher,
          day,
          timeSlot,
        });

        await booking.save();

        return res.status(201).json({
          ...booking.toObject(),
          conflictWarning: "Another student has also requested this time slot. The teacher will review all requests.",
        });
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

      // If approving a booking, automatically reject all other pending bookings for the same time slot
      if (status === "approved") {
        await Booking.updateMany(
          {
            _id: { $ne: booking._id }, // Exclude the just-approved booking
            teacher: booking.teacher,
            day: booking.day,
            "timeSlot.start": booking.timeSlot.start,
            "timeSlot.end": booking.timeSlot.end,
            status: "pending",
          },
          {
            $set: { status: "rejected" },
          }
        );
      }

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
        .populate("teacher", "name email profileImage");
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
        .populate("student", "name email profileImage");
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
