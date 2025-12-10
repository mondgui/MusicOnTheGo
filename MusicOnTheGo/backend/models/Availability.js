// backend/models/Availability.js
import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Support both day names (for recurring weekly) and specific dates
    day: {
      type: String,
      required: true,
      // Can be a day name or a date string (YYYY-MM-DD format)
    },
    // Specific date for calendar-based availability (optional, used when day is a date)
    date: {
      type: Date,
      required: false,
    },
    timeSlots: [
      {
        start: { type: String, required: true }, // ex: "14:00"
        end: { type: String, required: true },   // ex: "16:00"
      }
    ]
  },
  { timestamps: true }
);

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
