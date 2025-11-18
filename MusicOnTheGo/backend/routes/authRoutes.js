// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ---------------------------------------------------------
   REGISTER (SIGNUP)
--------------------------------------------------------- */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      instruments,
      experience,
      location,
      instrument          // support frontends still using singular field
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Normalize instruments into always an array
    const instrumentList = Array.isArray(instruments)
      ? instruments
      : instruments ? [instruments]
      : instrument ? [instrument]     // support older front-end
      : [];

    // Check uniqueness
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      instruments: instrumentList,  // always an array now
      experience: experience || "",
      location: location || "",
    });

    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        instruments: newUser.instruments,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   LOGIN
--------------------------------------------------------- */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required." });
    }

    // Look up user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found." });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password." });

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        instruments: user.instruments,
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
