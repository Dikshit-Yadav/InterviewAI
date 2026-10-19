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
  sendRegistrationCode,
  verifyRegistrationCode,
  sendPasswordResetCode,
  completePasswordReset,
} from "../controllers/authController.js";
import {
  emailBodySchema,
  googleCallbackQuerySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
  verifyEmailOtpBodySchema,
} from "../validation/schemas.js";

const router = express.Router();

router.post("/register", validateRequest({ body: registerBodySchema }), register);
router.post(
  "/register/send-code",
  validateRequest({ body: emailBodySchema }),
  sendRegistrationCode
);
router.post(
  "/register/verify-code",
  validateRequest({ body: verifyEmailOtpBodySchema }),
  verifyRegistrationCode
);
router.post(
  "/password/forgot",
  validateRequest({ body: emailBodySchema }),
  sendPasswordResetCode
);
router.post(
  "/password/reset",
  validateRequest({ body: resetPasswordBodySchema }),
  completePasswordReset
);
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