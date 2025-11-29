import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Guided Inquiry Fields
    instrument: { type: String, required: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    ageGroup: { type: String, enum: ["Child", "Teen", "Adult"], required: false },
    lessonType: { type: String, enum: ["In-person", "Online", "Either"], required: true },
    availability: { type: String, required: true },

    // Optional message
    message: { type: String, required: false },

    status: {
      type: String,
      enum: ["sent", "read", "responded"],
      default: "sent",
    }
  },
  { timestamps: true }
);



const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
