import InterviewSession from "../models/InterviewSession.js";
import Answer from "../models/Answer.js";
import Question from "../models/Question.js";
import Report from "../models/Report.js";
import { generateQuestions, evaluateAnswer, generateFinalReportAI } from "./aiService.js";

export const createInterviewSession = async (userId, role, experience, interviewType) => {
    if (!role || !experience || !interviewType) {
        throw new Error("All fields required");
    }

    const session = await InterviewSession.create({
        userId,
        role,
        experience,
        interviewType,
    });

    const questions = await generateQuestions(role, experience, interviewType);

    const questionDocs = questions.map((q, index) => ({
        interviewId: session._id,
        questionText: q,
        order: index + 1,
    }));

    await Question.insertMany(questionDocs);

    return session;
};


export const fetchInterviewQuestions = async (interviewId) => {
    const questions = await Question.find({ interviewId }).sort({ order: 1 });
    return questions;
};


export const submitAnswerService = async (questionId, interviewId, answer) => {
    if (!questionId || !interviewId || !answer) {
        throw new Error("All fields required");
    }

    const question = await Question.findById(questionId);

    if (!question) {
        throw new Error("Question not found");
    }

    const evaluation = await evaluateAnswer(
        question.questionText,
        answer
    );

    const saved = await Answer.create({
        questionId,
        interviewId,
        userAnswer: answer,
        aiEvaluation: evaluation,
        skill: evaluation.skill,
    });

    return saved;
};


export const generateReportService = async (interviewId) => {
    const answers = await Answer.find({ interviewId })
        .populate("questionId")
        .sort({ createdAt: 1 });

    if (!answers.length) {
        throw new Error("No answers found");
    }

    const existing = await Report.findOne({ interviewId });
    if (existing) return existing;

    const totalScore = answers.reduce(
        (sum, a) => sum + (a.aiEvaluation?.score || 0),
        0
    );

    const averageScore = totalScore / answers.length;

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