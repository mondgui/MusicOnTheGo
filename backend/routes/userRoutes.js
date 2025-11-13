// backend/routes/userRoutes.js
import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";



const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new user
router.post("/", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role || "student",
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 🧩 GET CURRENT LOGGED-IN USER (Protected)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // req.user contains: { id, role, iat, exp }
    const user = await User.findById(req.user.id).select("-password"); // hide password

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// DELETE USER BY ID (for testing only) This route is not protected — 
// anyone can delete users. For production, you’ll want to add authMiddleware and role checks.
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




// TEACHER-ONLY ROUTE
router.get("/teacher-only", authMiddleware, roleMiddleware("teacher"), (req, res) => {
  res.json({ message: "Welcome Teacher! You have special access." });
});

// STUDENT-ONLY ROUTE
router.get("/student-only", authMiddleware, roleMiddleware("student"), (req, res) => {
  res.json({ message: "Welcome Student! You have special access." });
});




export default router; // ES Module export
