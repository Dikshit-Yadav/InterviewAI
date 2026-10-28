import InterviewSession from "../models/InterviewSession.js";
import Answer from "../models/Answer.js";
import Question from "../models/Question.js";
import Report from "../models/Report.js";
import InterviewTemplate from "../models/InterviewTemplate.js";
import mongoose from "mongoose";
import crypto from "crypto";
import {
    generateQuestions,
    generateResumeInterview,
    generateAnswerFollowUp,
    evaluateAllAnswers,
    generateFinalReportAI,
    generateConfiguredQuestions,
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

export const createInterviewSession = async (
    userId,
    role,
    experience,
    interviewType,
    technologyScope = ""
) => {
    if (!role || !experience || !interviewType) {
        throw new Error("All fields required");
    }

    const normalizedTechnologyScope = technologyScope.trim()
        ? normalizeTechnologyScope(technologyScope)
        : "";
    const questions = await generateQuestions(
        role,
        experience,
        interviewType,
        normalizedTechnologyScope
    );
    const session = await InterviewSession.create({
        userId,
        role,
        experience,
        interviewType,
        technologyScope: normalizedTechnologyScope,
        requiresTechnologyScope: !normalizedTechnologyScope,
    });

    try {
        await Question.insertMany(
            questions.map((questionText, index) => ({
                interviewId: session._id,
                questionText,
                order: index + 1,
                isTechnologyClarification:
                    !normalizedTechnologyScope && index === 1,
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

const normalizeTechnologyScope = (technologies) => {
    const items = technologies
        .split(/[,\n;]+/)
        .map((technology) => technology.trim())
        .filter(Boolean);

    if (!items.length || items.length > 20) {
        throw httpError(400, "List between 1 and 20 technologies");
    }
    if (items.some((technology) => technology.length > 50)) {
        throw httpError(400, "Each technology must be 50 characters or fewer");
    }
    if (
        items.some(
            (technology) =>
                !/^[\p{L}\p{N}][\p{L}\p{N} .+#/-]*$/u.test(technology)
        )
    ) {
        throw httpError(
            400,
            "Enter technology names separated by commas, semicolons, or new lines"
        );
    }

    return [...new Set(items)].join(", ");
};

export const resolveInterviewTechnologyScope = async (
    userId,
    interviewId,
    questionId,
    technologies
) => {
    const session = await assertInterviewOwner(userId, interviewId);
    if (session.status !== "started") {
        throw httpError(400, "This interview has already been completed");
    }

    if (!session.requiresTechnologyScope && session.technologyScope) {
        return fetchInterviewQuestions(interviewId);
    }

    const clarification = await Question.findOne({
        _id: questionId,
        interviewId,
    });
    if (!clarification) {
        throw httpError(404, "Technology question not found for this interview");
    }
    if (!session.requiresTechnologyScope) {
        throw httpError(404, "Technology question not found for this interview");
    }
    if (!clarification.isTechnologyClarification) {
        throw httpError(404, "Technology question not found for this interview");
    }

    const technologyScope = normalizeTechnologyScope(technologies);
    const reserved = await InterviewSession.findOneAndUpdate(
        {
            _id: session._id,
            status: "started",
            requiresTechnologyScope: true,
            technologyScopeGenerating: { $ne: true },
        },
        { $set: { technologyScopeGenerating: true } },
        { new: true }
    );

    if (!reserved) {
        const latestSession = await InterviewSession.findById(session._id);
        if (latestSession && !latestSession.requiresTechnologyScope) {
            return fetchInterviewQuestions(interviewId);
        }
        throw httpError(409, "Technology-scoped questions are already being prepared");
    }

    try {
        const generatedQuestions = await generateQuestions(
            session.role,
            session.experience,
            session.interviewType,
            technologyScope
        );
        if (generatedQuestions.length !== 8) {
            throw new Error("AI did not return the expected scoped interview questions");
        }

        await Question.insertMany(
            generatedQuestions.slice(1).map((questionText, index) => ({
                interviewId,
                questionText,
                order: index + 2,
            }))
        );
        const removedClarification = await Question.deleteOne({
            _id: clarification._id,
            interviewId,
        });
        if (removedClarification.deletedCount !== 1) {
            throw new Error("Could not replace the technology clarification question");
        }
        await InterviewSession.updateOne(
            { _id: session._id, technologyScopeGenerating: true },
            {
                $set: {
                    technologyScope,
                    requiresTechnologyScope: false,
                    technologyScopeGenerating: false,
                },
            }
        );

    } catch (error) {
        try {
            await Question.deleteMany({ interviewId, order: { $gt: 1 } });
            await Question.create({
                _id: clarification._id,
                interviewId,
                questionText: clarification.questionText,
                order: clarification.order,
                isTechnologyClarification: true,
            });
        } finally {
            await InterviewSession.updateOne(
                { _id: session._id },
                { $set: { technologyScopeGenerating: false } }
            );
        }
        throw error;
    }

    return fetchInterviewQuestions(interviewId);
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
                technologyScope: session.technologyScope,
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

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const randomToken = (bytes = 24) => crypto.randomBytes(bytes).toString("hex");

export const createInterviewTemplate = async (ownerId, input) => {
    const technologies = input.technologies;
    const uniqueNames = new Set(technologies.map((item) => item.name.toLowerCase()));
    if (uniqueNames.size !== technologies.length) {
        throw httpError(400, "Each technology can only appear once");
    }
    if (input.questionCount < 2 || input.questionCount > 50) {
        throw httpError(400, "Question count must be between 2 and 50");
    }

    return InterviewTemplate.create({
        ownerId,
        title: input.title,
        role: input.role,
        interviewType: input.interviewType,
        technologies,
        questionCount: input.questionCount,
        durationMinutes: input.durationMinutes,
        shareToken: randomToken(18),
    });
};

export const listInterviewTemplates = (ownerId) =>
    InterviewTemplate.find({ ownerId }).sort({ createdAt: -1 }).lean();

export const getInterviewTemplateByToken = async (shareToken) => {
    const template = await InterviewTemplate.findOne({ shareToken, status: "active" }).lean();
    if (!template) throw httpError(404, "Interview link is inactive or invalid");
    return template;
};

export const joinInterviewTemplate = async (shareToken, candidateName) => {
    const template = await getInterviewTemplateByToken(shareToken);
    const attemptToken = randomToken(32);
    const attemptSeed = randomToken(24);
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + template.durationMinutes * 60 * 1000);

    const attempt = await InterviewSession.create({
        userId: template.ownerId,
        templateId: template._id,
        candidateName,
        role: template.role,
        experience: template.technologies
            .map((item) => item.level)
            .sort((a, b) => ["Beginner", "Intermediate", "Advanced"].indexOf(b) - ["Beginner", "Intermediate", "Advanced"].indexOf(a))[0],
        interviewType: template.interviewType,
        technologyScope: template.technologies.map((item) => item.name).join(", "),
        requiresTechnologyScope: false,
        attemptTokenHash: sha256(attemptToken),
        startedAt,
        expiresAt,
        status: "started",
    });

    try {
        const questions = await generateConfiguredQuestions({
            role: template.role,
            interviewType: template.interviewType,
            technologies: template.technologies,
            questionCount: template.questionCount,
            attemptSeed,
        });
        await Question.insertMany(
            questions.map((questionText, index) => ({
                interviewId: attempt._id,
                questionText,
                order: index + 1,
            }))
        );
    } catch (error) {
        await Promise.all([
            Question.deleteMany({ interviewId: attempt._id }),
            InterviewSession.deleteOne({ _id: attempt._id }),
        ]);
        throw error;
    }

    return {
        attemptId: attempt._id,
        attemptToken,
        title: template.title,
        candidateName,
        durationMinutes: template.durationMinutes,
        startedAt,
        expiresAt,
        questionCount: template.questionCount,
    };
};

export const assertSharedAttempt = async (attemptId, attemptToken) => {
    if (!attemptToken) throw httpError(401, "Missing interview attempt authorization");
    if (!mongoose.isValidObjectId(attemptId)) throw httpError(400, "Invalid interview attempt id");
    const attempt = await InterviewSession.findOne({
        _id: attemptId,
        attemptTokenHash: sha256(attemptToken),
        templateId: { $exists: true },
    }).select("+attemptTokenHash");
    if (!attempt) throw httpError(404, "Interview attempt not found");

    if (attempt.status === "started" && attempt.expiresAt <= new Date()) {
        attempt.status = "expired";
        attempt.submittedAt = new Date();
        await attempt.save();
    }
    return attempt;
};

export const fetchSharedInterviewQuestions = async (attemptId, attemptToken) => {
    await assertSharedAttempt(attemptId, attemptToken);
    return fetchInterviewQuestions(attemptId);
};

export const createSharedFollowUpQuestion = async (attemptId, attemptToken, questionId, answer) => {
    const session = await assertSharedAttempt(attemptId, attemptToken);
    if (session.status !== "started") throw httpError(400, "This interview is no longer active");

    const question = await Question.findOne({ _id: questionId, interviewId: attemptId });
    if (!question) throw httpError(404, "Question not found for this interview");
    if (question.order === 1 || question.followUpToQuestionId || answer.trim().length < 30) return null;
    if (await Question.findOne({ interviewId: attemptId, followUpToQuestionId: question._id })) return null;

    const questionCount = await Question.countDocuments({ interviewId: attemptId });
    const maxQuestions = await InterviewTemplate.findById(session.templateId).select("questionCount").lean();
    if (questionCount >= (maxQuestions?.questionCount || 50) + 4) return null;

    const reserved = await InterviewSession.findOneAndUpdate(
        { _id: session._id, status: "started", followUpCount: { $lt: 4 } },
        { $inc: { followUpCount: 1 } },
        { new: true }
    );
    if (!reserved) return null;

    try {
        const followUpText = await generateAnswerFollowUp(
            { role: session.role, experience: session.experience, interviewType: session.interviewType, technologyScope: session.technologyScope },
            question.questionText,
            answer.trim()
        );
        if (!followUpText) {
            await InterviewSession.updateOne({ _id: session._id }, { $inc: { followUpCount: -1 } });
            return null;
        }
        await Question.updateMany({ interviewId: attemptId, order: { $gt: question.order } }, { $inc: { order: 1 } });
        return await Question.create({
            interviewId: attemptId,
            questionText: followUpText,
            order: question.order + 1,
            followUpToQuestionId: question._id,
        });
    } catch (error) {
        await InterviewSession.updateOne({ _id: session._id, followUpCount: { $gt: 0 } }, { $inc: { followUpCount: -1 } });
        throw error;
    }
};

export const submitSharedInterviewService = async (attemptId, attemptToken, answers) => {
    const session = await assertSharedAttempt(attemptId, attemptToken);
    if (session.status !== "started") {
        if (session.status === "completed") return generateReportService(attemptId);
        throw httpError(409, "The interview time has ended");
    }

    const questions = await Question.find({ interviewId: attemptId }).sort({ order: 1 });
    const answerByQuestion = new Map(answers.map((item) => [String(item.questionId), item.answer.trim()]));
    const rows = questions.map((question) => ({ question, answer: answerByQuestion.get(String(question._id)) || "" }));
    if (!rows[0]?.answer) throw httpError(400, "Please answer the required brief introduction");

    const answered = rows.filter((row) => row.answer);
    const evaluations = await evaluateAllAnswers(
        { role: session.role, experience: session.experience, interviewType: session.interviewType },
        answered.map((row) => ({ question: row.question.questionText, answer: row.answer }))
    );
    let index = 0;
    const docs = rows.map((row) => {
        const evaluation = row.answer ? evaluations[index++] : { score: 0, strengths: "", weaknesses: "No answer was provided.", correctAnswer: "" };
        return {
            questionId: row.question._id,
            interviewId: attemptId,
            userAnswer: row.answer || "(No answer provided)",
            aiEvaluation: evaluation,
            skill: row.answer ? evaluation.skill : undefined,
        };
    });
    await Answer.deleteMany({ interviewId: attemptId });
    await Report.deleteMany({ interviewId: attemptId });
    await Answer.insertMany(docs);
    const report = await generateReportService(attemptId);
    session.status = "completed";
    session.submittedAt = new Date();
    await session.save();
    return report;
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
    if (session.requiresTechnologyScope) {
        throw httpError(400, "Answer the technology question before finishing the interview");
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
