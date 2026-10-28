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

    technologyScope: {
      type: String,
      trim: true,
      maxlength: 500,
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

    status: {
      type: String,
      enum: ["started", "completed", "expired"],
      default: "started",
    },
    followUpCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 4,
    },
  },
  { timestamps: true }
);

export default mongoose.model("InterviewSession", interviewSessionSchema);