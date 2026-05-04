import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { updateProfile } from "../controllers/profileController.js";

const router = express.Router();

router.put("/update", authMiddleware, updateProfile);

export default router;