import { randomBytes, timingSafeEqual } from "node:crypto";
import {
  getGoogleAuthorizationUrl,
  loginWithGoogleCode,
  registerUser,
  loginUser,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  requestPasswordReset,
  resetPassword,
} from "../services/authServices.js";
import logger from "../utils/logger.js";

const authCookieOptions = () => ({
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const googleStateCookieOptions = () => ({
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/auth/google",
  maxAge: 10 * 60 * 1000,
});

const redirectToLoginWithError = (res, error) => {
  if (!process.env.CLIENT_URL) {
    return res.status(500).json({ message: "CLIENT_URL is not configured" });
  }

  const url = new URL("/login", process.env.CLIENT_URL);
  url.searchParams.set("oauth_error", error);
  return res.redirect(url.toString());
};

export const register = async (req, res) => {
  try {
    const data = await registerUser(
      req.body.name,
      req.body.email,
      req.body.password,
      req.body.targetRole
    );
    res.status(201).json(data);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    if (
      ["All fields required", "Verify your email before creating an account", "User already exists"]
        .includes(err.message)
    ) {
      return res.status(400).json({ message: err.message });
    }
    logger.error({ err, requestId: req.id }, "Registration failed");
    return res.status(500).json({ message: "Could not create account" });
  }
};

export const sendRegistrationCode = async (req, res) => {
  try {
    await sendRegistrationOtp(req.body.email);
    return res.status(200).json({ message: "Verification code sent" });
  } catch (err) {
    if (err.message.includes("wait")) {
      return res.status(429).json({ message: err.message });
    }
    if (err.message.includes("already exists")) {
      return res.status(409).json({ message: err.message });
    }
    logger.error({ err, requestId: req.id }, "Registration OTP delivery failed");
    return res.status(503).json({ message: "Could not send the verification code" });
  }
};

export const verifyRegistrationCode = async (req, res) => {
  try {
    await verifyRegistrationOtp(req.body.email, req.body.code);
    return res.status(200).json({ message: "Email verified" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const sendPasswordResetCode = async (req, res) => {
  try {
    await requestPasswordReset(req.body.email);
    return res.status(200).json({
      message: "If an account exists for this email, a reset code has been sent",
    });
  } catch (err) {
    if (err.message.includes("wait")) {
      return res.status(429).json({ message: err.message });
    }
    logger.error({ err, requestId: req.id }, "Password reset OTP delivery failed");
    return res.status(503).json({ message: "Could not send the reset code" });
  }
};

export const completePasswordReset = async (req, res) => {
  try {
    await resetPassword(req.body.email, req.body.code, req.body.password);
    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body.email, req.body.password);

    res.cookie("token", data.token, {
      ...authCookieOptions(),
    });
    res.status(200).json(data);

  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export const googleLogin = (req, res) => {
  try {
    const state = randomBytes(32).toString("hex");
    res.cookie("google_oauth_state", state, googleStateCookieOptions());
    return res.redirect(getGoogleAuthorizationUrl(state));
  } catch (err) {
    logger.error({ err, requestId: req.id }, "Google OAuth initialization failed");
    return res.status(503).json({ message: "Google sign-in is unavailable" });
  }
};

export const googleCallback = async (req, res) => {
  const expectedState = req.cookies.google_oauth_state;
  res.clearCookie("google_oauth_state", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/auth/google",
  });

  const returnedState = typeof req.query.state === "string" ? req.query.state : "";
  const stateMatches =
    typeof expectedState === "string" &&
    expectedState.length === returnedState.length &&
    timingSafeEqual(Buffer.from(expectedState), Buffer.from(returnedState));

  if (!stateMatches) {
    return redirectToLoginWithError(res, "state_mismatch");
  }

  if (req.query.error) {
    return redirectToLoginWithError(
      res,
      req.query.error === "access_denied" ? "cancelled" : "google_auth_failed"
    );
  }

  if (typeof req.query.code !== "string") {
    return redirectToLoginWithError(res, "google_auth_failed");
  }

  try {
    const data = await loginWithGoogleCode(req.query.code);
    res.cookie("token", data.token, authCookieOptions());
    return res.redirect(new URL("/dashboard", process.env.CLIENT_URL).toString());
  } catch (err) {
    logger.error({ err, requestId: req.id }, "Google OAuth callback failed");
    return redirectToLoginWithError(res, "google_auth_failed");
  }
};

export const isme = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
        isauthenticate: false,
      });
    }
    res.status(200).json({ user: req.user, isauthenticate: true });
  } catch (err) {
    logger.error({ err, requestId: req.id }, "Authentication status check failed");
    res.status(500).json({ message: err.message });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token", authCookieOptions());
    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    logger.error({ err, requestId: req.id }, "Logout failed");
    res.status(500).json({ message: err.message });
  }
};