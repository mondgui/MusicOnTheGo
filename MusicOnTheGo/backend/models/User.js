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
      enum: ["teacher", "student"],
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
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

