import InterviewSession from "../models/InterviewSession.js";
import Report from "../models/Report.js";
import Answer from "../models/Answer.js";

export const getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await InterviewSession.find({ userId }).select("_id");
         const sessionIds = sessions.map(s => s._id);
        const totalInterviews = await InterviewSession.countDocuments({ userId });
        const answers = await Answer.find({ interviewId: { $in: sessionIds } });
        const skillMap = {};

        answers.forEach((a) => {
            const skill = a.skill || "Other";

            if (!skillMap[skill]) {
                skillMap[skill] = { total: 0, count: 0 };
            }

            skillMap[skill].total += a.aiEvaluation?.score || 0;
            skillMap[skill].count += 1;
        });

        const skillBreakdown = Object.keys(skillMap).map((skill) => ({
            skill,
            score: skillMap[skill].total / skillMap[skill].count,
        }));



       

        const reports = await Report.find({ interviewId: { $in: sessionIds } });


        const avgScore =
            reports.reduce((sum, r) => sum + (r.averageScore || 0), 0) /
            (reports.length || 1);


        const recentReports = reports.slice(-5);

        res.json({
            totalInterviews,
            avgScore,
            recentReports,
            skillBreakdown,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const sessions = await InterviewSession.find({ userId })
            .sort({ createdAt: -1 });

        res.json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};  