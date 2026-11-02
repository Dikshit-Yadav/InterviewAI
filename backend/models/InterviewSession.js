import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: "" },
  },
  { _id: false }
);

const codingQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    title: { type: String, default: "Technical Coding Challenge" },
    question: { type: String, required: true },
    language: { type: String, default: "javascript" },
    timeLimitSeconds: { type: Number, default: 1200 },
    constraints: { type: [String], default: [] },
    examples: { type: [exampleSchema], default: [] },
    starterCode: { type: String, default: "" },
    evaluationCriteria: {
      type: [String],
      default: [
        "Correctness",
        "Time Complexity",
        "Space Complexity",
        "Code Quality",
        "Edge Case Handling",
      ],
    },
  },
  { _id: false }
);

const codingSubmissionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, default: "javascript" },
    submittedAt: { type: Date, default: Date.now },
    evaluation: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const violationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["TAB_SWITCH", "FULLSCREEN_EXIT"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    role: {
      type: String,
      enum: ["ai", "candidate", "system"],
      required: true,
    },
    type: {
      type: String,
      enum: [
        "INTERVIEW_QUESTION",
        "CODING_QUESTION",
        "ANSWER",
        "CODE_SUBMISSION",
        "SYSTEM_NOTIFICATION",
        "INTERVIEW_REJECTED",
      ],
      required: true,
    },
    content: { type: String, required: true },
    questionId: { type: String, default: null },
    isFollowUp: { type: Boolean, default: false },
    isUnprofessional: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

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

    technologyScope: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    topicScope: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    requiresTechnologyScope: {
      type: Boolean,
      default: false,
    },
    technologyScopeGenerating: {
      type: Boolean,
      default: false,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewTemplate",
      index: true,
    },
    candidateName: { type: String, trim: true, maxlength: 100 },
    attemptTokenHash: { type: String, select: false },
    startedAt: { type: Date, index: true },
    expiresAt: { type: Date, index: true },
    submittedAt: { type: Date },
    durationMinutes: { type: Number, default: 30 },

    status: {
      type: String,
      enum: [
        "not_started",
        "in_progress",
        "coding_round",
        "evaluating",
        "completed",
        "terminated",
        "expired",
        "started",
      ],
      default: "started",
    },
    followUpCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    // Conversational real-time interview state
    conversationHistory: {
      type: [messageSchema],
      default: [],
    },

    // Coding round integration
    activeCodingQuestion: {
      type: codingQuestionSchema,
      default: null,
    },
    codingQuestions: {
      type: [codingQuestionSchema],
      default: [],
    },
    codingSubmissions: {
      type: [codingSubmissionSchema],
      default: [],
    },

    // Proctoring and security violations
    violations: {
      type: [violationSchema],
      default: [],
    },
    violationCount: {
      type: Number,
      default: 0,
    },
    cheatingDetected: {
      type: Boolean,
      default: false,
    },
    terminationReason: {
      type: String,
      default: null,
    },
    unprofessionalStrikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("InterviewSession", interviewSessionSchema);
