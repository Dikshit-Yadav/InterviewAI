import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
    },

    totalScore: {
      type: Number,
    },

    averageScore: {
      type: Number,
    },

    strengths: {
      type: String,
    },

    weaknesses: {
      type: String,
    },

    suggestions: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);