import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
    },
    skill: {
      type: String,
    },

    userAnswer: {
      type: String,
      required: true,
    },

    aiEvaluation: {
      score: {
        type: Number,
      },

      strengths: {
        type: String,
      },

      weaknesses: {
        type: String,
      },

      correctAnswer: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Answer", answerSchema);