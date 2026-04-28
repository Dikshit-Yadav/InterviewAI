import InterviewSession from "../models/InterviewSession.js";
import Report from "../models/Report.js";
import Answer from "../models/Answer.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalInterviews = await InterviewSession.countDocuments({ userId });

   
    const sessions = await InterviewSession.find({ userId }).select("_id");

    const sessionIds = sessions.map(s => s._id);

    const reports = await Report.find({ interviewId: { $in: sessionIds } });

    
    const avgScore =
      reports.reduce((sum, r) => sum + (r.averageScore || 0), 0) /
      (reports.length || 1);

    
    const recentReports = reports.slice(-5);

    res.json({
      totalInterviews,
      avgScore,
      recentReports,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};