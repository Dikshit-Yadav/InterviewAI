import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: true,
    },

    totalScore: Number,
    averageScore: Number,

    techScore: Number,
    clarityScore: Number,
    confidenceScore: Number,

    summary: String,

    strongTopics: [String],
    weakTopics: [String],

    learningPath: [String],

    tips: [String],

    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },

        question: String,
        userAnswer: String,

        aiEvaluation: {
          score: Number,
          strengths: String,
          weaknesses: String,
          correctAnswer: String,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);