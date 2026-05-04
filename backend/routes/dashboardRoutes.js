import express from "express";
import { getDashboard, getHistory} from "../controllers/dashboardController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, getDashboard);
router.get("/history", authMiddleware, getHistory)

export default router;