// backend/routes/teacherRoutes.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * PUBLIC — Get all teachers
 */
router.get("/", async (req, res) => {
  try {
    const { page, limit } = req.query;
    
    // Pagination parameters
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const filter = { role: "teacher" };

    if (req.query.instrument) {
      filter.instruments = { $in: [req.query.instrument] };
    }

    if (req.query.city) {
      filter.location = new RegExp(req.query.city, "i");
    }

    // Get total count
    const totalCount = await User.countDocuments(filter);

    // Fetch teachers with pagination
    const teachers = await User.find(filter)
      .select("name instruments experience location email createdAt rate about specialties profileImage")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }); // Most recent first

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasMore = pageNum < totalPages;

    res.json({
      teachers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages,
        hasMore,
      },
    });
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
      "name instruments experience location email createdAt rate about specialties profileImage"
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
