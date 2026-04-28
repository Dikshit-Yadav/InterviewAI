import express from "express";
import { startInterview, getQuestions, submitAnswer, generateReport} from "../controllers/interviewController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/start", authMiddleware, startInterview);
router.get("/questions/:id", authMiddleware, getQuestions);
router.post("/submit-answer", authMiddleware, submitAnswer);
router.post("/generate-report/:id", authMiddleware, generateReport )
export default router;