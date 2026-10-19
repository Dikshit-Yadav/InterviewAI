import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  googleCallback,
  googleLogin,
  isme,
  login,
  logout,
  register,
} from "../controllers/authController.js";
import {
  googleCallbackQuerySchema,
  loginBodySchema,
  registerBodySchema,
} from "../validation/schemas.js";

const router = express.Router();

router.post("/register", validateRequest({ body: registerBodySchema }), register);
router.post("/login", validateRequest({ body: loginBodySchema }), login);
router.get("/google", googleLogin);
router.get(
  "/google/callback",
  validateRequest({ query: googleCallbackQuerySchema }),
  googleCallback
);
router.get("/me",authMiddleware, isme);
router.post("/logout", authMiddleware, logout);

export default router;