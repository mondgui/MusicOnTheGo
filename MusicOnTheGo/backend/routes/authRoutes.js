// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from "../utils/emailService.js";

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

/* ---------------------------------------------------------
   FORGOT PASSWORD
--------------------------------------------------------- */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        message: "If an account with that email exists, we've sent password reset instructions.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Set token and expiration (1 hour from now)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:8081"}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send email
    try {
      await sendPasswordResetEmail(email, resetToken, resetUrl);
      console.log("✅ Password reset email successfully sent to:", email);
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      console.error("Error message:", emailError.message);
      console.error("Full error:", emailError);
      // Still return success to user, but log the error
    }

    res.json({
      message: "If an account with that email exists, we've sent password reset instructions.",
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ---------------------------------------------------------
   RESET PASSWORD
--------------------------------------------------------- */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    // Validate
    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: "Token, email, and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      email,
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired reset token. Please request a new password reset." 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    try {
      await sendPasswordResetConfirmation(email);
    } catch (emailError) {
      console.error("Confirmation email failed:", emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: "Password has been reset successfully. You can now log in with your new password.",
    });

  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
