// backend/models/User.js
import mongoose from "mongoose";

// Define the schema (structure of the user data)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Name is mandatory
    },
    email: {
      type: String,
      required: true,
      unique: true, // Email must be unique
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["teacher", "student"], // Only these two roles
      required: true,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create the model
const User = mongoose.model("User", userSchema);

export default User; // ES Module export
