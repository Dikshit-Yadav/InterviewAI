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
    select: false,
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
    default: "",
  },
  weakestSkill: {
    type: String,
    required: false,
    default: "",
  },
  experience: {
    type: String,
    required: false,
    default: "Intermediate",
  },
  education: {
    type: String,
    required: false,
    default: "",
  },
  bio: {
    type: String,
    required: false,
    default: "",
  },
  phone: {
    type: String,
    required: false,
    default: "",
  },
  location: {
    type: String,
    required: false,
    default: "",
  },
  github: {
    type: String,
    required: false,
    default: "",
  },
  linkedin: {
    type: String,
    required: false,
    default: "",
  },
  skills: {
    type: [String],
    required: false,
    default: [],
  },
  projects: {
    type: [String],
    required: false,
    default: [],
  },
  certifications: {
    type: [String],
    required: false,
    default: [],
  },
  resume: {
    type: String,
    required: false,
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
