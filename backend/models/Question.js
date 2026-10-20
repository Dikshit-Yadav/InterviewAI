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
    followUpToQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);