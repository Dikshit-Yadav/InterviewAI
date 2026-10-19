import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  googleCallback,
  googleLogin,
  isme,
  login,
  logout,
  register,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/me",authMiddleware, isme);
router.post("/logout", authMiddleware, logout);

export default router;