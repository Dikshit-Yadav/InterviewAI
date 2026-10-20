import InterviewSession from "../models/InterviewSession.js";
import Answer from "../models/Answer.js";
import Question from "../models/Question.js";
import Report from "../models/Report.js";
import mongoose from "mongoose";
import {
    generateQuestions,
    generateResumeInterview,
    generateAnswerFollowUp,
    evaluateAllAnswers,
    generateFinalReportAI,
} from "./aiService.js";

const httpError = (status, message) =>
    Object.assign(new Error(message), { status, isHttpError: true });
const MAX_INTERVIEW_QUESTIONS = 13;
const MAX_FOLLOW_UP_QUESTIONS = 2;

// throws 400/404/403 unless the interview exists and belongs to userId
export const assertInterviewOwner = async (userId, interviewId) => {
    if (!mongoose.isValidObjectId(interviewId)) {
        throw httpError(400, "Invalid interview id");
    }

    const session = await InterviewSession.findById(interviewId);
    if (!session) throw httpError(404, "Interview not found");
    if (!session.userId.equals(userId)) throw httpError(403, "Not allowed");

    return session;
};

export const createInterviewSession = async (userId, role, experience, interviewType) => {
    if (!role || !experience || !interviewType) {
        throw new Error("All fields required");
    }

    const questions = await generateQuestions(role, experience, interviewType);
    const session = await InterviewSession.create({
        userId,
        role,
        experience,
        interviewType,
    });

    try {
        await Question.insertMany(
            questions.map((questionText, index) => ({
                interviewId: session._id,
                questionText,
                order: index + 1,
            }))
        );
    } catch (error) {
        await Promise.all([
            Question.deleteMany({ interviewId: session._id }),
            InterviewSession.deleteOne({ _id: session._id }),
        ]);
        throw error;
    }

    return session;
};

export const createResumeInterviewSession = async (
    userId,
    resumeText,
    experience,
    interviewType
) => {
    const generated = await generateResumeInterview(resumeText, experience, interviewType);
    const session = await InterviewSession.create({
        userId,
        role: generated.role,
        experience,
        interviewType,
    });

    try {
        await Question.insertMany(
            generated.questions.map((questionText, index) => ({
                interviewId: session._id,
                questionText,
                order: index + 1,
            }))
        );
    } catch (error) {
        await Promise.all([
            Question.deleteMany({ interviewId: session._id }),
            InterviewSession.deleteOne({ _id: session._id }),
        ]);
        throw error;
    }

    return session;
};

export const createFollowUpQuestion = async (userId, interviewId, questionId, answer) => {
    const session = await assertInterviewOwner(userId, interviewId);
    if (session.status === "completed") {
        throw httpError(400, "This interview has already been completed");
    }

    const question = await Question.findOne({ _id: questionId, interviewId });
    if (!question) throw httpError(404, "Question not found for this interview");

    const existingFollowUp = await Question.findOne({
        interviewId,
        followUpToQuestionId: question._id,
    });
    if (existingFollowUp) return null;

    if (question.order === 1 || question.followUpToQuestionId || answer.trim().length < 30) {
        return null;
    }

    const questionCount = await Question.countDocuments({ interviewId });
    if (questionCount >= MAX_INTERVIEW_QUESTIONS || !answer.trim()) return null;

    const reserved = await InterviewSession.findOneAndUpdate(
        {
            _id: session._id,
            status: "started",
            $or: [
                { followUpCount: { $lt: MAX_FOLLOW_UP_QUESTIONS } },
                { followUpCount: { $exists: false } },
            ],
        },
        { $inc: { followUpCount: 1 } },
        { new: true }
    );
    if (!reserved) return null;

    let shifted = false;
    try {
        const followUpText = await generateAnswerFollowUp(
            {
                role: session.role,
                experience: session.experience,
                interviewType: session.interviewType,
            },
            question.questionText,
            answer.trim()
        );
        if (!followUpText) {
            await InterviewSession.updateOne(
                { _id: session._id },
                { $inc: { followUpCount: -1 } }
            );
            return null;
        }

        await Question.updateMany(
            { interviewId, order: { $gt: question.order } },
            { $inc: { order: 1 } }
        );
        shifted = true;

        return await Question.create({
            interviewId,
            questionText: followUpText,
            order: question.order + 1,
            followUpToQuestionId: question._id,
        });
    } catch (error) {
        if (shifted) {
            await Question.updateMany(
                { interviewId, order: { $gt: question.order + 1 } },
                { $inc: { order: -1 } }
            );
        }
        await InterviewSession.updateOne(
            { _id: session._id, followUpCount: { $gt: 0 } },
            { $inc: { followUpCount: -1 } }
        );
        if (error.code === 11000) {
            return Question.findOne({ interviewId, followUpToQuestionId: question._id });
        }
        throw error;
    }
};


export const fetchInterviewQuestions = async (interviewId) => {
    const questions = await Question.find({ interviewId }).sort({ order: 1 });
    return questions;
};


export const generateReportService = async (interviewId) => {
    const answers = await Answer.find({ interviewId })
        .populate("questionId")
        .sort({ createdAt: 1 });

    answers.sort((a, b) => (a.questionId?.order ?? 0) - (b.questionId?.order ?? 0));

    if (!answers.length) {
        throw new Error("No answers found");
    }

    const existing = await Report.findOne({ interviewId });
    if (existing) return existing;

    const totalScore = answers.reduce(
        (sum, a) => sum + (a.aiEvaluation?.score || 0),
        0
    );

    const averageScore = Math.round((totalScore / answers.length) * 10) / 10;

    const formattedAnswers = answers.map((a) => ({
        questionId: a.questionId?._id,
        question: a.questionId?.questionText,
        userAnswer: a.userAnswer,
        aiEvaluation: a.aiEvaluation,
    }));

    const aiReport = await generateFinalReportAI(formattedAnswers);

    const report = await Report.create({
        interviewId,

        totalScore,
        averageScore,

        techScore: aiReport.techScore,
        clarityScore: aiReport.clarityScore,
        confidenceScore: aiReport.confidenceScore,

        summary: aiReport.summary,

        strongTopics: aiReport.strongTopics,
        weakTopics: aiReport.weakTopics,

        learningPath: aiReport.learningPath,
        tips: aiReport.tips,

        answers: formattedAnswers,
    });

    return report;
};

// Receives ALL answers at once, evaluates them with the AI in one call,
// saves them, builds the final report and marks the interview completed.
// answers: [{ questionId, answer }]
export const submitInterviewService = async (userId, interviewId, answers) => {
    if (!Array.isArray(answers) || !answers.length) {
        throw httpError(400, "Answers are required");
    }

    const session = await assertInterviewOwner(userId, interviewId);

    // double-click / retry after success: just return the finished report
    if (session.status === "completed") {
        return generateReportService(interviewId);
    }

    const questions = await Question.find({ interviewId }).sort({ order: 1 });
    if (!questions.length) throw httpError(404, "No questions found for this interview");

    // only trust question ids that really belong to this interview
    const answerByQuestion = new Map(
        answers.map((a) => [
            String(a?.questionId),
            typeof a?.answer === "string" ? a.answer.trim() : "",
        ])
    );

    const rows = questions.map((q) => ({
        question: q,
        answer: answerByQuestion.get(String(q._id)) || "",
    }));

    if (!rows[0]?.answer) {
        throw httpError(400, "Please answer the required brief introduction before finishing");
    }

    const answered = rows.filter((r) => r.answer);
    if (!answered.length) {
        throw httpError(400, "Answer at least one question before submitting");
    }

    // 1 AI call for every answered question (skipped ones are not sent)
    const evaluations = await evaluateAllAnswers(
        {
            role: session.role,
            experience: session.experience,
            interviewType: session.interviewType,
        },
        answered.map((r) => ({ question: r.question.questionText, answer: r.answer }))
    );

    let next = 0;
    const docs = rows.map((r) => {
        const evaluation = r.answer
            ? evaluations[next++]
            : { score: 0, strengths: "", weaknesses: "No answer was provided.", correctAnswer: "" };

        return {
            questionId: r.question._id,
            interviewId,
            userAnswer: r.answer || "(No answer provided)",
            aiEvaluation: evaluation,
            skill: r.answer ? evaluation.skill : undefined,
        };
    });

    // replace anything from an earlier failed attempt so a retry is safe
    await Answer.deleteMany({ interviewId });
    await Report.deleteMany({ interviewId });
    await Answer.insertMany(docs);

    const report = await generateReportService(interviewId);

    session.status = "completed";
    await session.save();

    return report;
};
