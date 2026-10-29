import {
  createInterviewSession,
  createResumeInterviewSession,
  resolveInterviewTechnologyScope,
  createFollowUpQuestion,
  fetchInterviewQuestions,
  generateReportService,
  submitInterviewService,
  assertInterviewOwner,
  createInterviewTemplate,
  listInterviewTemplates,
  getInterviewTemplateByToken,
  joinInterviewTemplate,
  fetchSharedInterviewQuestions,
  createSharedFollowUpQuestion,
  submitSharedInterviewService,
} from "../services/interviewServices.js";
import logger from "../utils/logger.js";
import { extractResumeText } from "../services/resumeService.js";
import { reviewResume } from "../services/aiService.js";

const resumeAiErrorResponse = (error) => {
  if (error.status === 401 || error.status === 403) {
    return "AI provider credentials are invalid. Check GROQ_API_KEY in the backend environment.";
  }
  if (error.status === 404) {
    return "The configured AI model was not found. Check GROQ_RESUME_MODEL in the backend environment.";
  }
  if (error.status === 429) {
    return "The AI provider rate limit or quota has been reached. Try again later.";
  }
  if (error.status === 400) {
    return "The AI provider rejected the resume request. Check GROQ_RESUME_MODEL and GROQ_INTERVIEW_MODEL in the backend environment.";
  }
  return "The AI service could not process the resume. Check the backend logs and try again.";
};

export const startInterview = async (req, res) => {
  try {
    const { role, technologies = "", experience, interviewType } = req.body;

    const session = await createInterviewSession(
      req.user.id,
      role,
      experience,
      interviewType,
      technologies
    );

    res.status(200).json({
      message: "Interview started",
      interviewId: session._id,
    });

  } catch (error) {
    const isAiError = error.isAiError === true;
    const status = isAiError ? error.status : 400;
    logger.error(
      {
        err: error,
        providerStatus: error.status,
        providerCode: error.code,
        requestId: req.id,
      },
      "Could not start interview"
    );
    res.status(status).json({
      message: isAiError
        ? "The AI service could not generate interview questions. Please try again."
        : error.message,
    });

  }
};

export const resolveTechnologies = async (req, res) => {
  try {
    const questions = await resolveInterviewTechnologyScope(
      req.user.id,
      req.params.id,
      req.body.questionId,
      req.body.technologies
    );
    return res.status(200).json(questions);
  } catch (error) {
    if (error.isHttpError) {
      return res.status(error.status).json({ message: error.message });
    }
    logger.error({ err: error, requestId: req.id }, "Could not prepare scoped interview questions");
    return res.status(error.status || 502).json({
      message: error.isAiError
        ? "The AI service could not generate technology-scoped questions. Please try again."
        : "Could not prepare technology-scoped questions. Please try again.",
    });
  }
};

export const startResumeInterview = async (req, res) => {
  try {
    const resumeText = await extractResumeText(req.file);
    const session = await createResumeInterviewSession(
      req.user.id,
      resumeText,
      req.body.experience,
      req.body.interviewType
    );
    return res.status(201).json({
      message: "Resume-based interview started",
      interviewId: session._id,
      role: session.role,
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    logger.error({ err: error, requestId: req.id }, "Could not start resume interview");
    return res.status(error.status === 429 ? 503 : 502).json({
      message: resumeAiErrorResponse(error),
    });
  }
};

export const reviewUploadedResume = async (req, res) => {
  try {
    const resumeText = await extractResumeText(req.file);
    const review = await reviewResume(resumeText);
    return res.status(200).json(review);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ message: error.message });
    }
    logger.error({ err: error, requestId: req.id }, "Could not review resume");
    return res.status(error.status === 429 ? 503 : 502).json({
      message: resumeAiErrorResponse(error),
    });
  }
};


export const getQuestions = async (req, res) => {
  try {
    const { id } = req.params;

    await assertInterviewOwner(req.user.id, id);
    const questions = await fetchInterviewQuestions(id);

    res.status(200).json(questions);

  } catch (error) {
    if ((error.status || 500) >= 500) {
      logger.error({ err: error, requestId: req.id }, "Could not load interview questions");
    }
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getAnswerFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const followUp = await createFollowUpQuestion(
      req.user.id,
      id,
      req.body.questionId,
      req.body.answer
    );
    return res.status(200).json({ followUp });
  } catch (error) {
    if (error.isHttpError) {
      return res.status(error.status).json({ message: error.message });
    }
    logger.error(
      {
        err: error,
        providerStatus: error.status,
        providerCode: error.code,
        providerType: error.type,
        requestId: req.id,
      },
      "Could not generate answer follow-up"
    );
    return res.status(502).json({
      message: "The AI provider could not generate a follow-up. Please try again.",
    });
  }
};

export const generateReport = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await assertInterviewOwner(req.user.id, id);
    if (session.status !== "completed") {
      return res.status(409).json({
        message: "Finish the interview before opening its report.",
      });
    }
    const report = await generateReportService(id);

    res.status(200).json(report);

  } catch (err) {
    if ((err.status || 400) >= 500) {
      logger.error({ err, requestId: req.id }, "Could not generate interview report");
    }
    res.status(err.status || 400).json({ message: err.message });
  }
};
const attemptTokenFromRequest = (req) =>
  req.get("x-interview-attempt-token") || req.cookies?.interview_attempt_token;

export const createSharedInterview = async (req, res) => {
  try {
    const template = await createInterviewTemplate(req.user.id, req.body);
    const configuredOrigin = process.env.CLIENT_URL?.replace(/\/$/, "") || "";
    res.status(201).json({
      id: template._id,
      title: template.title,
      shareToken: template.shareToken,
      shareUrl: configuredOrigin ? `${configuredOrigin}/join/${template.shareToken}` : `/join/${template.shareToken}`,
      questionCount: template.questionCount,
      durationMinutes: template.durationMinutes,
    });
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

export const listSharedInterviews = async (req, res) => {
  const templates = await listInterviewTemplates(req.user.id);
  res.status(200).json(templates);
};

export const getSharedInterview = async (req, res) => {
  try {
    const template = await getInterviewTemplateByToken(req.params.token);
    res.status(200).json({
      title: template.title,
      role: template.role,
      interviewType: template.interviewType,
      technologies: template.technologies,
      questionCount: template.questionCount,
      durationMinutes: template.durationMinutes,
    });
  } catch (error) {
    res.status(error.status || 404).json({ message: error.message });
  }
};

export const joinSharedInterview = async (req, res) => {
  try {
    const joined = await joinInterviewTemplate(req.params.token, req.body.candidateName);
    res.cookie("interview_attempt_token", joined.attemptToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: joined.durationMinutes * 60 * 1000,
    });
    res.status(201).json(joined);
  } catch (error) {
    if ((error.status || 400) >= 500) {
      logger.error({ err: error, requestId: req.id }, "Could not start shared interview");
    }
    res.status(error.status || 502).json({ message: error.message });
  }
};

export const getSharedInterviewQuestions = async (req, res) => {
  try {
    const questions = await fetchSharedInterviewQuestions(req.params.id, attemptTokenFromRequest(req));
    res.status(200).json(questions);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getSharedAnswerFollowUp = async (req, res) => {
  try {
    const followUp = await createSharedFollowUpQuestion(
      req.params.id,
      attemptTokenFromRequest(req),
      req.body.questionId,
      req.body.answer
    );
    res.status(200).json({ followUp });
  } catch (error) {
    res.status(error.status || 502).json({ message: error.message });
  }
};

export const submitSharedInterview = async (req, res) => {
  try {
    const report = await submitSharedInterviewService(
      req.params.id,
      attemptTokenFromRequest(req),
      req.body.answers
    );
    res.clearCookie("interview_attempt_token");
    res.status(200).json(report);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

export const submitInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const report = await submitInterviewService(req.user.id, id, answers);

    res.status(200).json(report);

  } catch (err) {
    if ((err.status || 400) >= 500) {
      logger.error({ err, requestId: req.id }, "Could not submit interview");
    }
    res.status(err.status || 400).json({ message: err.message });
  }
};
