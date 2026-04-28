import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
    },

    questionText: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);