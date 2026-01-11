// backend/routes/availabilityRoutes.js
import express from "express";
import Availability from "../models/Availability.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get io instance from server (will be set by server.js)
let io = null;
export function setSocketIO(socketIO) {
  io = socketIO;
}

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

      // Emit real-time event for availability update
      if (io) {
        const teacherIdStr = String(req.user.id);
        // Emit to teacher's availability room
        io.to(`teacher-availability:${teacherIdStr}`).emit("availability-updated");
      }

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

      // Emit real-time event for availability update
      if (io) {
        const teacherIdStr = String(req.user.id);
        // Emit to teacher's availability room
        io.to(`teacher-availability:${teacherIdStr}`).emit("availability-updated");
      }

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
    
    // Filter availability: keep date-based items that are today or future, and all recurring weekly items
    // Use the 'day' field (YYYY-MM-DD) when available, as it represents the user's selected date
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const todayStr = todayUTC.toISOString().split('T')[0]; // YYYY-MM-DD format in UTC
    
    // Calculate yesterday in UTC to account for timezone differences
    // (e.g., if it's late evening in US, it might already be tomorrow in UTC)
    const yesterdayUTC = new Date(todayUTC);
    yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);
    const yesterdayStr = yesterdayUTC.toISOString().split('T')[0];
    
    let availability = allAvailability.filter((item) => {
      // If day is in YYYY-MM-DD format, use it for comparison (this is the date the user selected)
      // Allow items from yesterday UTC onwards to account for timezone differences
      if (item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
        return item.day >= yesterdayStr; // Keep if yesterday, today, or future
      }
      // If it has a specific date field (fallback), check if it's in the past
      if (item.date) {
        const itemDate = new Date(item.date);
        // Validate that the date is valid before using it
        if (isNaN(itemDate.getTime())) {
          return false; // Invalid date, filter it out
        }
        // Compare dates in UTC to avoid timezone issues
        const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        const itemDateUTC = new Date(Date.UTC(itemDate.getUTCFullYear(), itemDate.getUTCMonth(), itemDate.getUTCDate()));
        return itemDateUTC >= todayUTC; // Keep if today or future
      }
      // If no date field, it's recurring weekly availability (e.g., "Monday") - keep it
      return true;
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
      // Normalize booking.day to a consistent format
      let bookingDayKey = booking.day;
      
      // If booking.day is a date string (YYYY-MM-DD format), use it as-is
      if (booking.day && /^\d{4}-\d{2}-\d{2}$/.test(booking.day)) {
        bookingDayKey = booking.day;
      }
      // If booking.day is a day name (e.g., "Monday"), use it as-is for recurring availability matching
      // Note: bookingDayKey will be the day name in this case
      
      const key = `${bookingDayKey}-${booking.timeSlot.start}-${booking.timeSlot.end}`;
      bookedSlots.add(key);
    });
    
    // Filter out booked time slots from availability
    availability = availability.map((item) => {
      const availableTimeSlots = (item.timeSlots || []).filter((slot) => {
        // Normalize item.day for comparison - must match booking normalization logic
        let itemDayKey = item.day;
        
        if (item.date) {
          // Date-based availability: convert date to YYYY-MM-DD format
          // If item.day is already a date string, use it; otherwise convert from item.date
          if (item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
            // item.day is already a date string, use it
            itemDayKey = item.day;
          } else {
            // Convert item.date to YYYY-MM-DD format using UTC to ensure consistency
            const dateObj = new Date(item.date);
            if (!isNaN(dateObj.getTime())) {
              const year = dateObj.getUTCFullYear();
              const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getUTCDate()).padStart(2, '0');
              itemDayKey = `${year}-${month}-${day}`;
            }
          }
        }
        // If no date field, item.day is a day name (e.g., "Monday") - use it as-is for recurring availability
        
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

      // Emit real-time event for availability update
      if (io) {
        const teacherIdStr = String(req.user.id);
        // Emit to teacher's availability room
        io.to(`teacher-availability:${teacherIdStr}`).emit("availability-updated");
      }

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
      // Use the 'day' field (YYYY-MM-DD) when available, as it represents the user's selected date
      const today = new Date();
      const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      const todayStr = todayUTC.toISOString().split('T')[0]; // YYYY-MM-DD format in UTC
      
      // Calculate yesterday in UTC to account for timezone differences
      // (e.g., if it's late evening in US, it might already be tomorrow in UTC)
      const yesterdayUTC = new Date(todayUTC);
      yesterdayUTC.setUTCDate(yesterdayUTC.getUTCDate() - 1);
      const yesterdayStr = yesterdayUTC.toISOString().split('T')[0];
      
      const availability = allAvailability.filter((item) => {
        // If day is in YYYY-MM-DD format, use it for comparison (this is the date the user selected)
        // Allow items from yesterday UTC onwards to account for timezone differences
        if (item.day && /^\d{4}-\d{2}-\d{2}$/.test(item.day)) {
          return item.day >= yesterdayStr; // Keep if yesterday, today, or future
        }
        // If it has a specific date field (fallback), check if it's in the past
        if (item.date) {
          const itemDate = new Date(item.date);
          // Validate that the date is valid before using it
          if (isNaN(itemDate.getTime())) {
            return false; // Invalid date, filter it out
          }
          // Compare dates in UTC to avoid timezone issues
          const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
          const itemDateUTC = new Date(Date.UTC(itemDate.getUTCFullYear(), itemDate.getUTCMonth(), itemDate.getUTCDate()));
          return itemDateUTC >= todayUTC; // Keep if today or future
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
