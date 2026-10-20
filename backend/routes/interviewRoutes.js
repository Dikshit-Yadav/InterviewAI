import express from "express";
import {
  startInterview,
  startResumeInterview,
  reviewUploadedResume,
  getQuestions,
  getAnswerFollowUp,
  generateReport,
  submitInterview,
} from "../controllers/interviewController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import resumeUpload from "../middlewares/resumeUpload.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  interviewIdParamsSchema,
  interviewFollowUpBodySchema,
  interviewStartBodySchema,
  resumeInterviewBodySchema,
  submitAnswersBodySchema,
} from "../validation/schemas.js";

const router = express.Router();

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
