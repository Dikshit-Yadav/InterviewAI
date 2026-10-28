import mongoose from "mongoose";

const technologySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
  },
  { _id: false }
);

const interviewTemplateSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 100 },
    interviewType: { type: String, required: true },
    technologies: { type: [technologySchema], required: true },
    questionCount: { type: Number, required: true, min: 3, max: 50 },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
    shareToken: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("InterviewTemplate", interviewTemplateSchema);
