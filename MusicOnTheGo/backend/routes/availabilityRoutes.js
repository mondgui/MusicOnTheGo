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
      const { day, timeSlots } = req.body;

      if (!day || !timeSlots) {
        return res.status(400).json({ message: "Day and timeSlots are required." });
      }

      const availability = new Availability({
        teacher: req.user.id,
        day,
        timeSlots,
      });

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

export default router;
