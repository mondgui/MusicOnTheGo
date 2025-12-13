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
      // Validate that the date is valid before using it
      if (isNaN(itemDate.getTime())) {
        return false; // Invalid date, filter it out
      }
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= today; // Keep if today or future
    });
    
    // Get all approved bookings for this teacher to filter out booked slots
    const approvedBookings = await Booking.find({
      teacher: req.params.teacherId,
      status: "approved",
    });
    
    // Create a set of booked time slots for quick lookup
    // Normalize day/date format for consistent comparison
    const bookedSlots = new Set();
    approvedBookings.forEach((booking) => {
      // Normalize booking.day: if it's a date string (YYYY-MM-DD), use it as-is
      // If it's a day name, we need to match it with availability items that have the same day name
      // For date-based availability, we need to compare the actual date
      let bookingDayKey = booking.day;
      
      // If booking.day looks like a date (YYYY-MM-DD format), normalize it
      if (booking.day && /^\d{4}-\d{2}-\d{2}$/.test(booking.day)) {
        // It's a date string, use it directly
        bookingDayKey = booking.day;
      }
      
      const key = `${bookingDayKey}-${booking.timeSlot.start}-${booking.timeSlot.end}`;
      bookedSlots.add(key);
    });
    
    // Filter out booked time slots from availability
    availability = availability.map((item) => {
      const availableTimeSlots = (item.timeSlots || []).filter((slot) => {
        // Normalize item.day for comparison
        let itemDayKey = item.day;
        
        // If item has a date field and item.day is a date string, use the date string
        // Otherwise, use item.day as-is (could be day name or date string)
        if (item.date && item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
          // item.day is already a date string, use it
          itemDayKey = item.day;
        } else if (item.date) {
          // item has a date field, convert it to YYYY-MM-DD format for comparison
          const dateObj = new Date(item.date);
          if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            itemDayKey = `${year}-${month}-${day}`;
          }
        }
        
        const key = `${itemDayKey}-${slot.start}-${slot.end}`;
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
          // Validate that the date is valid before using it
          if (isNaN(itemDate.getTime())) {
            return false; // Invalid date, filter it out
          }
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
