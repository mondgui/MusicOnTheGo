// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["teacher", "student", "admin"],
      required: true,
    },

    // NEW — instruments taught or learned (supports ONE or MULTIPLE)
    instruments: {
      type: [String],    // always stored as an array
      default: [],
    },

    // NEW — only used for teachers, optional for students
    experience: {
      type: String,
      default: "",       // teachers can fill, students can ignore
    },

    // NEW — city, state, etc.
    location: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "",
    },
    
    rate: {
      type: Number,
      default: 0,
    },
    
    // Teacher-specific: Specialties (e.g., "Beginners Welcome", "Music Theory", etc.)
    specialties: {
      type: [String],
      default: [],
    },
    
    // Teacher-specific: Rating and review fields
    averageRating: {
      type: Number,
      default: null, // null means no ratings yet
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Student-specific fields
    skillLevel: {
      type: String,
      default: "",
    },
    learningMode: {
      type: String,
      default: "",
    },
    ageGroup: {
      type: String,
      default: "",
    },
    availability: {
      type: String,
      default: "",
    },
    goals: {
      type: String,
      default: "",
    },
    
    // Profile image URL
    profileImage: {
      type: String,
      default: "",
    },
    
    // Password reset fields
    resetPasswordToken: {
      type: String,
      default: "",
    },
    resetPasswordExpires: {
      type: Date,
    },
    
    // Student-specific: Weekly practice goal in minutes
    weeklyGoal: {
      type: Number,
      default: null, // null means not set yet
      min: 1,
    },
    
    // Notification preferences
    pushNotificationsEnabled: {
      type: Boolean,
      default: true, // Default to enabled
    },
    
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
