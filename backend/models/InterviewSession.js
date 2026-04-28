import mongoose from "mongoose";

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    interviewType: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started",
    },
  },
  { timestamps: true }
);

export default mongoose.model("InterviewSession", interviewSessionSchema);