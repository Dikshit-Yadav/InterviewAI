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
