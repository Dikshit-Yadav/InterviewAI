import express from "express";
import {
  startInterview,
  startResumeInterview,
  reviewUploadedResume,
  getQuestions,
  getAnswerFollowUp,
  resolveTechnologies,
  generateReport,
  submitInterview,
  createSharedInterview,
  listSharedInterviews,
  getSharedInterview,
  joinSharedInterview,
  getSharedInterviewQuestions,
  getSharedAnswerFollowUp,
  submitSharedInterview,
  getSessionState,
  sendInterviewMessage,
  submitCodingSolution,
  logInterviewViolation,
} from "../controllers/interviewController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import resumeUpload from "../middlewares/resumeUpload.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  interviewIdParamsSchema,
  interviewFollowUpBodySchema,
  interviewStartBodySchema,
  interviewTechnologiesBodySchema,
  resumeInterviewBodySchema,
  submitAnswersBodySchema,
  sharedInterviewCreateBodySchema,
  sharedInterviewJoinBodySchema,
  sharedInterviewTokenSchema,
  sharedInterviewAttemptParamsSchema,
} from "../validation/schemas.js";

const router = express.Router();

// Real-time conversational interview endpoints
router.get(
  "/session/:id",
  authMiddleware,
  validateRequest({ params: interviewIdParamsSchema }),
  getSessionState
);

router.post(
  "/session/:id/message",
  authMiddleware,
  validateRequest({ params: interviewIdParamsSchema }),
  sendInterviewMessage
);

router.post(
  "/session/:id/submit-code",
  authMiddleware,
  validateRequest({ params: interviewIdParamsSchema }),
  submitCodingSolution
);

router.post(
  "/session/:id/violation",
  authMiddleware,
  validateRequest({ params: interviewIdParamsSchema }),
  logInterviewViolation
);

// Shared assessment endpoints
router.post(
  "/shared",
  authMiddleware,
  validateRequest({ body: sharedInterviewCreateBodySchema }),
  createSharedInterview
);
router.get("/shared", authMiddleware, listSharedInterviews);
router.get(
  "/shared/:token",
  validateRequest({ params: sharedInterviewTokenSchema }),
  getSharedInterview
);
router.post(
  "/shared/:token/join",
  validateRequest({ params: sharedInterviewTokenSchema, body: sharedInterviewJoinBodySchema }),
  joinSharedInterview
);
router.get(
  "/shared-attempt/:id/questions",
  validateRequest({ params: sharedInterviewAttemptParamsSchema }),
  getSharedInterviewQuestions
);
router.post(
  "/shared-attempt/:id/follow-up",
  validateRequest({ params: sharedInterviewAttemptParamsSchema, body: interviewFollowUpBodySchema }),
  getSharedAnswerFollowUp
);
router.post(
  "/shared-attempt/:id/submit",
  validateRequest({ params: sharedInterviewAttemptParamsSchema, body: submitAnswersBodySchema }),
  submitSharedInterview
);

// Standard mock interview endpoints
router.post(
  "/start",
  authMiddleware,
  validateRequest({ body: interviewStartBodySchema }),
  startInterview
);
router.post(
  "/start-from-resume",
  authMiddleware,
  resumeUpload,
  validateRequest({ body: resumeInterviewBodySchema }),
  startResumeInterview
);
router.post(
  "/review-resume",
  authMiddleware,
  resumeUpload,
  reviewUploadedResume
);
router.get(
  "/questions/:id",
  authMiddleware,
  validateRequest({ params: interviewIdParamsSchema }),
  getQuestions
);
router.post(
  "/follow-up/:id",
  authMiddleware,
  validateRequest({
    params: interviewIdParamsSchema,
    body: interviewFollowUpBodySchema,
  }),
  getAnswerFollowUp
);
router.post(
  "/technologies/:id",
  authMiddleware,
  validateRequest({
    params: interviewIdParamsSchema,
    body: interviewTechnologiesBodySchema,
  }),
  resolveTechnologies
);
router.post(
  "/submit/:id",
  authMiddleware,
  validateRequest({
    params: interviewIdParamsSchema,
    body: submitAnswersBodySchema,
  }),
  submitInterview
);
router.post(
  "/generate-report/:id",
  authMiddleware,
  validateRequest({ params: interviewIdParamsSchema }),
  generateReport
);

export default router;
