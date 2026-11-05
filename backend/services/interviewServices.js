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
    generateStructuredInterviewTurn,
    evaluateCodeRubricAI,
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
        status: "started",
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
    if (session.status !== "started" && session.status !== "in_progress") {
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
        status: "started",
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
    if (session.status === "completed" || session.status === "terminated") {
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
        topicScope: template.technologies
            .map((item) => `${item.name}: ${(item.topics || []).join(", ")}`)
            .join("; "),
        requiresTechnologyScope: false,
        attemptTokenHash: sha256(attemptToken),
        startedAt,
        expiresAt,
        durationMinutes: template.durationMinutes,
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
    if (session.status !== "started" && session.status !== "in_progress") {
        throw httpError(400, "This interview is no longer active");
    }

    const question = await Question.findOne({ _id: questionId, interviewId: attemptId });
    if (!question) throw httpError(404, "Question not found for this interview");
    if (question.order === 1 || question.followUpToQuestionId || answer.trim().length < 30) return null;
    if (await Question.findOne({ interviewId: attemptId, followUpToQuestionId: question._id })) return null;

    const questionCount = await Question.countDocuments({ interviewId: attemptId });
    const maxQuestions = await InterviewTemplate.findById(session.templateId).select("questionCount").lean();
    if (questionCount >= (maxQuestions?.questionCount || 50) + 4) return null;

    const reserved = await InterviewSession.findOneAndUpdate(
        { _id: session._id, followUpCount: { $lt: 4 } },
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
    if (session.status !== "started" && session.status !== "in_progress") {
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
    const session = await InterviewSession.findById(interviewId);

    // Calculate multi-criteria scoring including coding performance
    const codingSubmissions = session?.codingSubmissions || [];
    const validEvaluations = codingSubmissions.map((s) => s.evaluation).filter(Boolean);
    let codingPerformance = 0;
    let codeQuality = 0;

    if (validEvaluations.length > 0) {
        const sumScore = validEvaluations.reduce((acc, curr) => acc + (curr.score || 0), 0);
        codingPerformance = Math.round(sumScore / validEvaluations.length);
        const sumQuality = validEvaluations.reduce((acc, curr) => acc + (curr.codeQuality?.score || 0), 0);
        codeQuality = Math.round(sumQuality / validEvaluations.length);
    }

    const techScaled = Math.round((aiReport.techScore || 0) * 10);
    const clarityScaled = Math.round((aiReport.clarityScore || 0) * 10);
    const confidenceScaled = Math.round((aiReport.confidenceScore || 0) * 10);

    let overallScore = Math.round(averageScore * 10);
    if (validEvaluations.length > 0) {
        overallScore = Math.round((overallScore * 0.5) + (codingPerformance * 0.3) + (techScaled * 0.2));
    }

    // Proctoring check penalty if cheating detected
    if (session?.cheatingDetected) {
        overallScore = Math.min(overallScore, 40);
    }

    const report = await Report.create({
        interviewId,

        totalScore,
        averageScore,

        techScore: aiReport.techScore,
        clarityScore: aiReport.clarityScore,
        confidenceScore: aiReport.confidenceScore,

        // Upgraded composite scores
        overallScore,
        technicalKnowledge: techScaled,
        communication: clarityScaled,
        problemSolving: confidenceScaled,
        codingPerformance,
        codeQuality,

        summary: aiReport.summary,
        finalFeedback: aiReport.summary,

        strongTopics: aiReport.strongTopics || [],
        weakTopics: aiReport.weakTopics || [],
        strengths: aiReport.strongTopics || [],
        weaknesses: aiReport.weakTopics || [],
        recommendations: aiReport.tips || [],

        learningPath: aiReport.learningPath || [],
        tips: aiReport.tips || [],

        answers: formattedAnswers,

        // Proctoring and security evaluation data
        cheatingDetected: session?.cheatingDetected || false,
        violationCount: session?.violationCount || 0,
        violations: session?.violations || [],
        interviewStatus: session?.status || "completed",
        terminationReason: session?.terminationReason || null,
        codingEvaluations: validEvaluations,
    });

    return report;
};

export const submitInterviewService = async (userId, interviewId, answers) => {
    const session = await assertInterviewOwner(userId, interviewId);

    if (session.status === "completed") {
        return generateReportService(interviewId);
    }
    if (session.requiresTechnologyScope) {
        throw httpError(400, "Answer the technology question before finishing the interview");
    }

    let questions = await Question.find({ interviewId }).sort({ order: 1 });
    if (!questions.length) {
        const aiQuestions = (session.conversationHistory || []).filter(
            (m) => m.role === "ai" && (m.type === "INTERVIEW_QUESTION" || m.type === "CODING_QUESTION")
        );
        if (aiQuestions.length > 0) {
            const dynamicDocs = aiQuestions.map((q, idx) => ({
                interviewId,
                questionText: q.content,
                order: idx + 1,
            }));
            questions = await Question.insertMany(dynamicDocs);
        } else {
            const fallbackDoc = await Question.create({
                interviewId,
                questionText: `Technical assessment for ${session.role}`,
                order: 1,
            });
            questions = [fallbackDoc];
        }
    }

    const candidateChatMessages = (session.conversationHistory || [])
        .filter((m) => m.role === "candidate" && (m.type === "ANSWER" || m.type === "CODE_SUBMISSION"));

    const answerByQuestion = new Map();
    if (Array.isArray(answers)) {
        answers.forEach((a) => {
            if (a?.questionId) {
                answerByQuestion.set(String(a.questionId), typeof a.answer === "string" ? a.answer.trim() : "");
            }
        });
    }

    const isEarlyExit =
        session.status === "terminated" ||
        (session.violationCount || 0) >= 2 ||
        session.status === "expired" ||
        session.cheatingDetected;

    const rows = questions.map((q, idx) => {
        let answer = answerByQuestion.get(String(q._id)) || "";
        if (!answer && candidateChatMessages[idx]?.content) {
            answer = candidateChatMessages[idx].content;
        }
        return {
            question: q,
            answer: answer || "",
        };
    });

    if (!rows[0]?.answer && !isEarlyExit) {
        throw httpError(400, "Please answer the required brief introduction before finishing");
    }

    const answered = rows.filter((r) => r.answer && r.answer.trim());
    let evaluations = [];

    if (answered.length > 0) {
        evaluations = await evaluateAllAnswers(
            {
                role: session.role,
                experience: session.experience,
                interviewType: session.interviewType,
            },
            answered.map((r) => ({ question: r.question.questionText, answer: r.answer }))
        );
    }

    let next = 0;
    const docs = rows.map((r) => {
        const hasAns = Boolean(r.answer && r.answer.trim());
        const evaluation = hasAns
            ? evaluations[next++] || { score: 50, strengths: "Answer submitted", weaknesses: "", correctAnswer: "" }
            : {
                score: 0,
                strengths: "N/A",
                weaknesses: isEarlyExit ? "Not Attempted (assessment terminated early)." : "No answer was provided.",
                correctAnswer: ""
              };

        return {
            questionId: r.question._id,
            interviewId,
            userAnswer: r.answer || (isEarlyExit ? "(Not Attempted)" : "(No answer provided)"),
            aiEvaluation: evaluation,
            skill: hasAns ? evaluation.skill : undefined,
        };
    });

    await Answer.deleteMany({ interviewId });
    await Report.deleteMany({ interviewId });
    await Answer.insertMany(docs);

    const report = await generateReportService(interviewId);

    if (session.status !== "terminated") {
        session.status = "completed";
    }
    session.submittedAt = new Date();
    await session.save();

    return report;
};

// ==========================================
// REAL-TIME CONVERSATIONAL INTERVIEW SERVICES
// ==========================================

export const getInterviewSessionState = async (userId, interviewId) => {
    const session = await assertInterviewOwner(userId, interviewId);

    // Initialize timers if not set
    if (!session.startedAt) {
        session.startedAt = new Date();
        session.durationMinutes = session.durationMinutes || 30;
        session.expiresAt = new Date(session.startedAt.getTime() + session.durationMinutes * 60 * 1000);
        if (session.status === "not_started" || session.status === "started") {
            session.status = "in_progress";
        }
    }

    // Initialize conversation history dynamically if empty
    if (!session.conversationHistory || session.conversationHistory.length === 0) {
        const questions = await Question.find({ interviewId }).sort({ order: 1 });
        let openingQuestionText = "";
        let qId = "";

        if (questions.length > 0) {
            openingQuestionText = questions[0].questionText;
            qId = String(questions[0]._id);
        } else {
            openingQuestionText = `Welcome to your technical assessment for the role of ${session.role} (${session.experience} level). To start our technical discussion, please give me a brief overview of your background and walk me through a challenging technical problem you solved recently in your projects.`;
            qId = crypto.randomUUID();
            await Question.create({
                interviewId,
                questionText: openingQuestionText,
                order: 1,
            }).catch(() => {});
        }

        session.conversationHistory = [
            {
                id: `ai-${qId}`,
                role: "ai",
                type: "INTERVIEW_QUESTION",
                content: openingQuestionText,
                questionId: qId,
                isFollowUp: false,
                timestamp: new Date(),
            },
        ];
    }

    await session.save();

    const now = Date.now();
    const expiresAtMs = session.expiresAt
        ? new Date(session.expiresAt).getTime()
        : now + 30 * 60 * 1000;
    const remainingSeconds = Math.max(0, Math.floor((expiresAtMs - now) / 1000));

    if (remainingSeconds === 0 && session.status !== "completed" && session.status !== "terminated") {
        session.status = "expired";
        await session.save();
    }

    return {
        interviewId: session._id,
        role: session.role,
        experience: session.experience,
        interviewType: session.interviewType,
        technologyScope: session.technologyScope,
        status: session.status,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        remainingSeconds,
        durationMinutes: session.durationMinutes,
        violationCount: session.violationCount || 0,
        unprofessionalStrikes: session.unprofessionalStrikes || 0,
        followUpCount: session.followUpCount || 0,
        cheatingDetected: session.cheatingDetected || false,
        terminationReason: session.terminationReason || null,
        conversationHistory: session.conversationHistory || [],
        activeCodingQuestion: session.activeCodingQuestion || null,
    };
};

export const processInterviewMessage = async (userId, interviewId, messageText) => {
    const session = await assertInterviewOwner(userId, interviewId);

    if (session.status === "completed" || session.status === "terminated" || session.status === "expired") {
        throw httpError(400, `Interview is already ${session.status}`);
    }
    if (session.violationCount >= 2) {
        throw httpError(403, "Interview terminated due to exceeding violation limits");
    }
    if (session.unprofessionalStrikes >= 3) {
        throw httpError(403, "Interview terminated due to repeated unprofessional conduct");
    }
    if (session.expiresAt && Date.now() > new Date(session.expiresAt).getTime()) {
        session.status = "expired";
        await session.save();
        throw httpError(400, "Interview duration has expired. Please view your report.");
    }

    // 1. Add candidate answer to conversation history
    const candidateMessage = {
        id: `ans-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
        role: "candidate",
        type: "ANSWER",
        content: messageText.trim(),
        timestamp: new Date(),
    };

    session.conversationHistory.push(candidateMessage);

    // 2. Call AI to generate next structured turn
    const structuredTurn = await generateStructuredInterviewTurn({
        role: session.role,
        experience: session.experience,
        interviewType: session.interviewType,
        technologyScope: session.technologyScope,
        conversationHistory: session.conversationHistory,
        codingQuestionsCount: session.codingQuestions ? session.codingQuestions.length : 0,
        candidateAnswer: messageText.trim(),
        unprofessionalStrikes: session.unprofessionalStrikes || 0,
        followUpCount: session.followUpCount || 0,
    });

    // Check for unprofessional behavior detection
    if (structuredTurn.isUnprofessional) {
        session.unprofessionalStrikes = (session.unprofessionalStrikes || 0) + 1;
    }

    // If 3 strikes reached or AI issued termination rejection
    if (session.unprofessionalStrikes >= 3 || structuredTurn.type === "INTERVIEW_REJECTED") {
        session.status = "terminated";
        session.terminationReason = "UNPROFESSIONAL_CONDUCT";
        session.submittedAt = new Date();

        const rejectionMessage = {
            id: `ai-rejection-${Date.now()}`,
            role: "ai",
            type: "INTERVIEW_REJECTED",
            content: structuredTurn.question || structuredTurn.message || "You have repeatedly displayed unprofessional conduct and failed to take this assessment seriously despite multiple warnings. As a result, we will not be moving forward with your candidacy. This interview is concluded.",
            questionId: structuredTurn.questionId || crypto.randomUUID(),
            timestamp: new Date(),
        };
        session.conversationHistory.push(rejectionMessage);
        await session.save();

        return {
            turn: {
                ...structuredTurn,
                type: "INTERVIEW_REJECTED",
                question: rejectionMessage.content,
            },
            status: session.status,
            terminationReason: session.terminationReason,
            unprofessionalStrikes: session.unprofessionalStrikes,
            activeCodingQuestion: session.activeCodingQuestion,
            conversationHistory: session.conversationHistory,
        };
    }

    // Safety check: Never exceed 2 coding questions per interview session
    if (structuredTurn.type === "CODING_QUESTION" && (session.codingQuestions?.length || 0) >= 2) {
        structuredTurn.type = "INTERVIEW_QUESTION";
        structuredTurn.stage = "Core Questions";
        structuredTurn.isFollowUp = false;
        structuredTurn.question = "Let's discuss how your code architecture handles edge cases and scaling in a live production environment.";
    }

    // 3. Process response by type
    if (structuredTurn.type === "CODING_QUESTION") {
        session.activeCodingQuestion = {
            questionId: structuredTurn.questionId,
            title: structuredTurn.title || "Technical Coding Challenge",
            question: structuredTurn.question,
            language: structuredTurn.language || "javascript",
            timeLimitSeconds: structuredTurn.timeLimitSeconds || 1200,
            constraints: structuredTurn.constraints || [],
            examples: structuredTurn.examples || [],
            starterCode: structuredTurn.starterCode || "",
            evaluationCriteria: structuredTurn.evaluationCriteria || [],
        };
        session.codingQuestions.push(session.activeCodingQuestion);
        session.status = "coding_round";

        session.conversationHistory.push({
            id: `ai-${structuredTurn.questionId}`,
            role: "ai",
            type: "CODING_QUESTION",
            content: structuredTurn.question,
            questionId: structuredTurn.questionId,
            isFollowUp: false,
            timestamp: new Date(),
            metadata: session.activeCodingQuestion,
        });

        // Persist dynamic coding challenge as a question record
        const countCoding = await Question.countDocuments({ interviewId });
        await Question.create({
            interviewId,
            questionText: structuredTurn.question,
            order: countCoding + 1,
            isTechnologyClarification: false,
        }).catch(() => {});
    } else if (structuredTurn.type === "INTERVIEW_COMPLETE") {
        session.status = "completed";
        session.conversationHistory.push({
            id: `ai-${Date.now()}`,
            role: "ai",
            type: "SYSTEM_NOTIFICATION",
            content: structuredTurn.message || "Interview completed.",
            timestamp: new Date(),
        });
    } else {
        if (structuredTurn.isFollowUp) {
            session.followUpCount = (session.followUpCount || 0) + 1;
        }
        session.conversationHistory.push({
            id: `ai-${structuredTurn.questionId}`,
            role: "ai",
            type: "INTERVIEW_QUESTION",
            content: structuredTurn.question,
            questionId: structuredTurn.questionId,
            isFollowUp: structuredTurn.isFollowUp || false,
            isUnprofessional: structuredTurn.isUnprofessional || false,
            timestamp: new Date(),
        });

        // Persist dynamic interview question
        const countQ = await Question.countDocuments({ interviewId });
        await Question.create({
            interviewId,
            questionText: structuredTurn.question,
            order: countQ + 1,
            isTechnologyClarification: false,
        }).catch(() => {});
    }

    await session.save();

    return {
        turn: structuredTurn,
        status: session.status,
        terminationReason: session.terminationReason || null,
        unprofessionalStrikes: session.unprofessionalStrikes || 0,
        followUpCount: session.followUpCount || 0,
        activeCodingQuestion: session.activeCodingQuestion,
        conversationHistory: session.conversationHistory,
    };
};

export const recordSessionViolation = async (userId, interviewId, violationType) => {
    const session = await assertInterviewOwner(userId, interviewId);

    if (session.status === "completed" || session.status === "terminated") {
        return {
            violationCount: session.violationCount || 0,
            cheatingDetected: session.cheatingDetected || false,
            terminationReason: session.terminationReason || null,
            status: session.status,
        };
    }

    session.violations = session.violations || [];
    session.violations.push({
        type: violationType,
        timestamp: new Date(),
    });
    session.violationCount = (session.violationCount || 0) + 1;

    if (session.violationCount >= 2) {
        session.cheatingDetected = true;
        session.terminationReason = "MAX_VIOLATIONS_EXCEEDED";
        session.status = "terminated";
        session.submittedAt = new Date();
    }

    await session.save();

    return {
        violationCount: session.violationCount,
        cheatingDetected: session.cheatingDetected,
        terminationReason: session.terminationReason,
        status: session.status,
    };
};

export const processCodeSubmission = async (userId, interviewId, { code, language, questionId }) => {
    const session = await assertInterviewOwner(userId, interviewId);

    if (session.status === "completed" || session.status === "terminated" || session.status === "expired") {
        throw httpError(400, `Interview is already ${session.status}`);
    }
    if (session.violationCount >= 2) {
        throw httpError(403, "Interview terminated due to exceeding violation limits");
    }
    if (session.expiresAt && Date.now() > new Date(session.expiresAt).getTime()) {
        session.status = "expired";
        await session.save();
        throw httpError(400, "Interview duration has expired. Please view your report.");
    }

    const activeQ = session.activeCodingQuestion;
    const resolvedQuestionId = questionId || activeQ?.questionId || crypto.randomUUID();
    const questionText = activeQ?.question || "Coding challenge implementation";
    const criteria = activeQ?.evaluationCriteria || [];

    const evaluation = await evaluateCodeRubricAI({
        questionId: resolvedQuestionId,
        question: questionText,
        language: language || "javascript",
        code,
        evaluationCriteria: criteria,
    });

    const submissionDoc = {
        questionId: resolvedQuestionId,
        code,
        language: language || "javascript",
        submittedAt: new Date(),
        evaluation,
    };

    session.codingSubmissions.push(submissionDoc);

    session.conversationHistory.push({
        id: `code-sub-${Date.now()}`,
        role: "candidate",
        type: "CODE_SUBMISSION",
        content: `Solution submitted in ${language}:\n\`\`\`${language}\n${code}\n\`\`\``,
        questionId: submissionDoc.questionId,
        timestamp: new Date(),
    });

    const followUpQuestion = evaluation.followUpQuestion ||
        "Thank you. Can you explain your choice of algorithm and how your solution handles edge cases?";

    const canAskCodeFollowUp = (session.followUpCount || 0) < 3;
    if (canAskCodeFollowUp) {
        session.followUpCount = (session.followUpCount || 0) + 1;
    }

    session.conversationHistory.push({
        id: `ai-code-followup-${Date.now()}`,
        role: "ai",
        type: "INTERVIEW_QUESTION",
        content: followUpQuestion,
        questionId: submissionDoc.questionId,
        isFollowUp: canAskCodeFollowUp,
        timestamp: new Date(),
    });

    session.status = "in_progress";
    await session.save();

    return {
        evaluation,
        followUpQuestion,
        status: session.status,
        conversationHistory: session.conversationHistory,
    };
};
