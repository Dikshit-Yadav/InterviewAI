import User from "../models/User.js";
import InterviewSession from "../models/InterviewSession.js";
import Report from "../models/Report.js";
import logger from "../utils/logger.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const totalInterviews = await InterviewSession.countDocuments({ userId: user._id });
    const sessions = await InterviewSession.find({ userId: user._id }).sort({ createdAt: -1 });
    const sessionIds = sessions.map((s) => s._id);

    const reports = await Report.find({ interviewId: { $in: sessionIds } });
    const totalScore = reports.reduce((sum, r) => sum + (r.averageScore || 0), 0);
    const avgScore = reports.length ? Math.round((totalScore / reports.length) * 10) / 10 : 0;

    const latestSession = sessions[0] || null;

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole || "Full Stack Developer",
        experience: user.experience || "Intermediate",
        education: user.education || "",
        bio: user.bio || "",
        skills: user.skills || [],
        strongstSkill: user.strongstSkill || "",
        weakestSkill: user.weakestSkill || "",
        location: user.location || "",
        phone: user.phone || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        createdAt: user.createdAt,
      },
      stats: {
        totalInterviews,
        avgScore,
        completedInterviews: reports.length,
        latestInterview: latestSession
          ? {
              _id: latestSession._id,
              role: latestSession.role,
              interviewType: latestSession.interviewType,
              createdAt: latestSession.createdAt,
              status: latestSession.status,
            }
          : null,
      },
    });
  } catch (err) {
    logger.error({ err, requestId: req.id }, "Profile fetch failed");
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      targetRole,
      experience,
      education,
      bio,
      skills,
      strongstSkill,
      weakestSkill,
      location,
      phone,
      github,
      linkedin,
    } = req.body;

    const updateFields = {
      ...(name !== undefined && { name }),
      ...(targetRole !== undefined && { targetRole }),
      ...(experience !== undefined && { experience }),
      ...(education !== undefined && { education }),
      ...(bio !== undefined && { bio }),
      ...(Array.isArray(skills) && { skills }),
      ...(strongstSkill !== undefined && { strongstSkill }),
      ...(weakestSkill !== undefined && { weakestSkill }),
      ...(location !== undefined && { location }),
      ...(phone !== undefined && { phone }),
      ...(github !== undefined && { github }),
      ...(linkedin !== undefined && { linkedin }),
    };

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        experience: user.experience || "Intermediate",
        education: user.education || "",
        bio: user.bio || "",
        skills: user.skills || [],
        strongstSkill: user.strongstSkill || "",
        weakestSkill: user.weakestSkill || "",
        location: user.location || "",
        phone: user.phone || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    logger.error({ err, requestId: req.id }, "Profile update failed");
    res.status(500).json({ message: err.message });
  }
};
