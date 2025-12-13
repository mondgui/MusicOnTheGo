// backend/routes/availabilityRoutes.js
import express from "express";
import Availability from "../models/Availability.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * TEACHER: Create availability
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const { day, date, timeSlots } = req.body;

      if (!day || !timeSlots) {
        return res.status(400).json({ message: "Day and timeSlots are required." });
      }

      const availabilityData = {
        teacher: req.user.id,
        day,
        timeSlots,
      };

      // If date is provided, parse and store it
      if (date) {
        availabilityData.date = new Date(date);
      }

      const availability = new Availability(availabilityData);

      await availability.save();
      res.status(201).json(availability);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * TEACHER: Update availability
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const availability = await Availability.findById(req.params.id);

      if (!availability) {
        return res.status(404).json({ message: "Availability not found." });
      }

      if (availability.teacher.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      availability.day = req.body.day || availability.day;
      availability.timeSlots = req.body.timeSlots || availability.timeSlots;
      
      // Update date if provided
      if (req.body.date !== undefined) {
        availability.date = req.body.date ? new Date(req.body.date) : null;
      }

      await availability.save();
      res.json(availability);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * STUDENT: View availability for a teacher
 */
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const Booking = (await import("../models/Booking.js")).default;
    
    const allAvailability = await Availability.find({
      teacher: req.params.teacherId,
    });
    
    // Filter out past dates and old recurring weekly availability (entries without date field)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    
    let availability = allAvailability.filter((item) => {
      // Only keep entries with a date field (new calendar-based availability)
      if (!item.date) {
        return false; // Filter out old recurring weekly availability
      }
      // Check if the date is today or in the future
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= today; // Keep if today or future
    });
    
    // Get all approved bookings for this teacher to filter out booked slots
    const approvedBookings = await Booking.find({
      teacher: req.params.teacherId,
      status: "approved",
    });
    
    // Create a set of booked time slots for quick lookup
    const bookedSlots = new Set();
    approvedBookings.forEach((booking) => {
      const key = `${booking.day}-${booking.timeSlot.start}-${booking.timeSlot.end}`;
      bookedSlots.add(key);
    });
    
    // Filter out booked time slots from availability
    availability = availability.map((item) => {
      const availableTimeSlots = (item.timeSlots || []).filter((slot) => {
        const key = `${item.day}-${slot.start}-${slot.end}`;
        return !bookedSlots.has(key);
      });
      
      return {
        ...item.toObject(),
        timeSlots: availableTimeSlots,
      };
    }).filter((item) => item.timeSlots.length > 0); // Only keep items with available slots
    
    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * TEACHER: Delete availability
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const availability = await Availability.findById(req.params.id);

      if (!availability) {
        return res.status(404).json({ message: "Not found." });
      }

      if (availability.teacher.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      await availability.deleteOne();
      res.json({ message: "Availability deleted." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * TEACHER: Get your own availability
 */
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const allAvailability = await Availability.find({
        teacher: req.user.id,
      });
      
      // Filter out past dates (keep recurring weekly availability and future dates)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today
      
      const availability = allAvailability.filter((item) => {
        // If it has a specific date, check if it's in the past
        if (item.date) {
          const itemDate = new Date(item.date);
          itemDate.setHours(0, 0, 0, 0);
          return itemDate >= today; // Keep if today or future
        }
        // If no date field, it's recurring weekly availability - keep it
        return true;
      });

      res.json(availability);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);



export default router;
