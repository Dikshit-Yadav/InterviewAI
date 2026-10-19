import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: false,
  },
  emailVerified: {
    type: Boolean,
    default: true,
  },
  targetRole: {
    type: String,
    required: true,
    default: "Full Stack Developer",
  },
  strongstSkill: {
    type: String,
    required: false,
  },
  weakestSkill: {
    type: String,
    required: false,
  },
  experience: {
    type: String,
    required: false,
  },
  education: {
    type: String,
    required: false,
  },
  skills: {
    type: [String],
    required: false,
  },
  projects: {
    type: [String],
    required: false,
  },
  certifications: {
    type: [String],
    required: false,
  },
  resume: {
    type: String,
    required: false,
  },

}, { timestamps: true });

export default mongoose.model("User", userSchema);