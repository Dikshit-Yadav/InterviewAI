import express from "express";
import { getDashboard} from "../controllers/dashboardController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("", authMiddleware, getDashboard);

export default router;