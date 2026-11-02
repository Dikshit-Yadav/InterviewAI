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

    // Upgraded multi-criteria scoring
    overallScore: Number,
    technicalKnowledge: Number,
    communication: Number,
    problemSolving: Number,
    codingPerformance: Number,
    codeQuality: Number,

    summary: String,
    finalFeedback: String,

    strongTopics: [String],
    weakTopics: [String],
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],

    learningPath: [String],
    tips: [String],

    // Proctoring and behavior metadata
    cheatingDetected: {
      type: Boolean,
      default: false,
    },
    violationCount: {
      type: Number,
      default: 0,
    },
    violations: [
      {
        type: { type: String },
        timestamp: { type: Date },
      },
    ],
    interviewStatus: {
      type: String,
      default: "completed",
    },
    terminationReason: {
      type: String,
      default: null,
    },

    // Coding round evaluations
    codingEvaluations: [mongoose.Schema.Types.Mixed],

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
