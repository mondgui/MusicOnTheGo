import express from "express";
import Inquiry from "../models/Inquiry.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * STUDENT: Send inquiry to a teacher
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      teacher,
      instrument,
      level,
      ageGroup,
      lessonType,
      availability,
      message,
    } = req.body;

    if (!teacher || !instrument || !level || !lessonType || !availability) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const inquiry = await Inquiry.create({
      student: req.user.id,
      teacher,
      instrument,
      level,
      ageGroup,
      lessonType,
      availability,
      message,
    });

    res.status(201).json(inquiry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * TEACHER: View inquiries sent to them
 */
router.get(
  "/teacher/me",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const inquiries = await Inquiry.find({ teacher: req.user.id })
        .populate("student", "name email");

      res.json(inquiries);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * TEACHER: Mark inquiry as responded
 */
router.put(
  "/:id/responded",
  authMiddleware,
  roleMiddleware("teacher"),
  async (req, res) => {
    try {
      const inquiry = await Inquiry.findById(req.params.id);

      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found." });
      }

      if (inquiry.teacher.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized." });
      }

      inquiry.status = "responded";  // ✅ FIXED
      await inquiry.save();

      res.json(inquiry);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
