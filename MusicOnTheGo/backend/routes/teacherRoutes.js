// backend/routes/teacherRoutes.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * PUBLIC — Get all teachers
 */
router.get("/", async (req, res) => {
  try {
    const filter = { role: "teacher" };

    if (req.query.instrument) {
      filter.instruments = { $in: [req.query.instrument] };
    }

    if (req.query.city) {
      filter.location = new RegExp(req.query.city, "i");
    }

    const teachers = await User.find(filter).select(
      "name instruments experience location email createdAt rate about"
    );

    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUBLIC — Get a single teacher by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
      role: "teacher",
    }).select(
      "name instruments experience location email createdAt rate about"
    );

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
