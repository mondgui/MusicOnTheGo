// backend/routes/userRoutes.js

import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

/* -----------------------------------------------------
   GET ALL USERS  (DEV TEST ONLY)
----------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -----------------------------------------------------
   CREATE USER (DEV TEST ONLY — real registration is in authRoutes.js)
----------------------------------------------------- */
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

/* -----------------------------------------------------
   GET CURRENT LOGGED-IN USER
----------------------------------------------------- */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found." });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -----------------------------------------------------
   UPDATE CURRENT LOGGED-IN USER  (Profile Setup)
----------------------------------------------------- */
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const updates = {};

    // shared
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.instruments !== undefined) updates.instruments = req.body.instruments;
    if (req.body.location !== undefined) updates.location = req.body.location;
    if (req.body.profileImage !== undefined) updates.profileImage = req.body.profileImage;

    // student fields
    if (req.body.weeklyGoal !== undefined) updates.weeklyGoal = req.body.weeklyGoal;

    // teacher fields
    if (req.body.experience !== undefined) updates.experience = req.body.experience;
    if (req.body.rate !== undefined) updates.rate = req.body.rate;
    if (req.body.about !== undefined) updates.about = req.body.about;
    if (req.body.specialties !== undefined) updates.specialties = req.body.specialties;

    // student fields
    if (req.body.skillLevel !== undefined) updates.skillLevel = req.body.skillLevel;
    if (req.body.learningMode !== undefined) updates.learningMode = req.body.learningMode;
    if (req.body.ageGroup !== undefined) updates.ageGroup = req.body.ageGroup;
    if (req.body.availability !== undefined) updates.availability = req.body.availability;
    if (req.body.goals !== undefined) updates.goals = req.body.goals;

    // notification preferences
    if (req.body.pushNotificationsEnabled !== undefined) updates.pushNotificationsEnabled = req.body.pushNotificationsEnabled;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile." });
  }
});

/* -----------------------------------------------------
   CHANGE PASSWORD (requires current password)
----------------------------------------------------- */
router.put("/me/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    // Trim passwords to remove whitespace
    const trimmedNewPassword = String(newPassword).trim();
    const trimmedCurrentPassword = String(currentPassword).trim();

    if (trimmedNewPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    // Get user with password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify current password
    const bcrypt = await import("bcryptjs");
    const isMatch = await bcrypt.compare(trimmedCurrentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(trimmedNewPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to change password." });
  }
});

/* -----------------------------------------------------
   GET USER BY ID (for chat/contacts)
----------------------------------------------------- */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found." });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -----------------------------------------------------
   DELETE USER (DEV ONLY)
----------------------------------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* -----------------------------------------------------
   ROLE-BASED TEST ROUTES
----------------------------------------------------- */
router.get("/teacher-only",
  authMiddleware,
  roleMiddleware("teacher"),
  (req, res) => {
    res.json({ message: "Welcome Teacher! You have special access." });
  }
);

router.get("/student-only",
  authMiddleware,
  roleMiddleware("student"),
  (req, res) => {
    res.json({ message: "Welcome Student! You have special access." });
  }
);

export default router;
