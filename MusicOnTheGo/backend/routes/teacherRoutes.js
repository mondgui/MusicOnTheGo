import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * PUBLIC — Get all teachers
 * Later we can add filters like:
 * ?instrument=guitar
 * ?city=Boston
 */
router.get("/", async (req, res) => {
  try {
    const filter = { role: "teacher" };

    // Optional filters (future)
    if (req.query.instrument) {
      filter.instruments = { $in: [req.query.instrument] };
    }

    if (req.query.city) {
      filter.location = new RegExp(req.query.city, "i");
    }

    const teachers = await User.find(filter)
      .select("name instruments experience location email createdAt");

    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUBLIC — Get a single teacher by ID
 * For teacher profile screen
 */
router.get("/:id", async (req, res) => {
  try {
    const teacher = await User.findOne({
      _id: req.params.id,
      role: "teacher",
    }).select("name instruments experience location email createdAt");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
