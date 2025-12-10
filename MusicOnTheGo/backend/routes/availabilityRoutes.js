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
    const availability = await Availability.find({
      teacher: req.params.teacherId,
    });
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
      const availability = await Availability.find({
        teacher: req.user.id,
      });

      res.json(availability);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);



export default router;
