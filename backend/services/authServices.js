import User from "../models/User.js";
import EmailOtp from "../models/EmailOtp.js";
import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import generateToken from "../utils/jwt.js";
import { sendOtpEmail } from "./mailjetService.js";

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_INTERVAL_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

const sendOtp = async (email, purpose) => {
  const normalizedEmail = email.toLowerCase();
  const existingChallenge = await EmailOtp.findOne({
    email: normalizedEmail,
    purpose,
  });
  if (
    existingChallenge &&
    Date.now() - existingChallenge.sentAt.getTime() < OTP_RESEND_INTERVAL_MS
  ) {
    throw new Error("Please wait before requesting another code");
  }

  const code = randomInt(100000, 1000000).toString();
  const challenge = await EmailOtp.findOneAndUpdate(
    { email: normalizedEmail, purpose },
    {
      email: normalizedEmail,
      purpose,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      sentAt: new Date(),
      verifiedAt: null,
      attempts: 0,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  try {
    await sendOtpEmail(normalizedEmail, code, purpose);
  } catch (error) {
    await EmailOtp.deleteOne({ _id: challenge._id });
    throw error;
  }
};

const verifyOtp = async (email, code, purpose) => {
  const challenge = await EmailOtp.findOne({
    email: email.toLowerCase(),
    purpose,
  });
  if (!challenge || challenge.expiresAt.getTime() <= Date.now()) {
    throw new Error("The code is invalid or expired");
  }
  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    throw new Error("Too many attempts. Request a new code");
  }

  if (!(await bcrypt.compare(code, challenge.codeHash))) {
    await EmailOtp.updateOne(
      { _id: challenge._id, attempts: { $lt: OTP_MAX_ATTEMPTS } },
      { $inc: { attempts: 1 } }
    );
    throw new Error("The code is invalid or expired");
  }

  return challenge;
};

export const sendRegistrationOtp = async (email) => {
  const normalizedEmail = email.toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    throw new Error("An account with this email already exists");
  }
  await sendOtp(normalizedEmail, "registration");
};

export const verifyRegistrationOtp = async (email, code) => {
  const challenge = await verifyOtp(email, code, "registration");
  const result = await EmailOtp.updateOne(
    {
      _id: challenge._id,
      codeHash: challenge.codeHash,
      expiresAt: { $gt: new Date() },
      attempts: { $lt: OTP_MAX_ATTEMPTS },
    },
    { $set: { verifiedAt: new Date() } }
  );
  if (!result.matchedCount) throw new Error("The code is invalid or expired");
};

export const registerUser = async (name, email, password, targetRole) => {

   if (!name || !email || !password || !targetRole) {
      throw new Error("All fields required");
    }

  const normalizedEmail = email.toLowerCase();
  const challenge = await EmailOtp.findOne({
    email: normalizedEmail,
    purpose: "registration",
    verifiedAt: { $ne: null },
    expiresAt: { $gt: new Date() },
  });
  if (!challenge) throw new Error("Verify your email before creating an account");

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
     name,
      email: normalizedEmail,
      password: hashed,
      targetRole,
      emailVerified: true,
  });
  await EmailOtp.deleteOne({ _id: challenge._id });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    targetRole: user.targetRole,
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) throw new Error("User not found");
  if (!user.password) throw new Error("This account uses Google sign-in");
  if (!user.emailVerified) throw new Error("Please verify your email before signing in");

  const match = await bcrypt.compare(password, user.password);

  if (!match) throw new Error("Invalid credentials");

  return {
    id: user._id,
    email: user.email,
    token: generateToken(user.email, user.targetRole),
  };
};

export const requestPasswordReset = async (email) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (user?.password) {
    await sendOtp(normalizedEmail, "password-reset");
  }
};

export const resetPassword = async (email, code, password) => {
  const normalizedEmail = email.toLowerCase();
  const challenge = await verifyOtp(normalizedEmail, code, "password-reset");
  const user = await User.findOne({ email: normalizedEmail });
  if (!user?.password) {
    throw new Error("Password reset is unavailable for this account");
  }

  const consumed = await EmailOtp.deleteOne({
    _id: challenge._id,
    codeHash: challenge.codeHash,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: OTP_MAX_ATTEMPTS },
  });
  if (!consumed.deletedCount) throw new Error("The code is invalid or expired");

  user.password = await bcrypt.hash(password, 10);
  await user.save();
};

const   getGoogleConfig = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } =
    process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
    throw new Error("Google OAuth environment variables are not configured");
  }

  return { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL };
};

export const getGoogleAuthorizationUrl = (state) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } = getGoogleConfig();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", GOOGLE_CALLBACK_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);

  return url.toString();
};

export const loginWithGoogleCode = async (code) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } =
    getGoogleConfig();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Google token exchange failed (${tokenResponse.status})`);
  }

  const tokens = await tokenResponse.json();
  if (typeof tokens.access_token !== "string") {
    throw new Error("Google did not return an access token");
  }

  const profileResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );

  if (!profileResponse.ok) {
    throw new Error(`Google profile request failed (${profileResponse.status})`);
  }

  const profile = await profileResponse.json();
  if (
    typeof profile.sub !== "string" ||
    typeof profile.email !== "string" ||
    profile.email_verified !== true
  ) {
    throw new Error("Google account did not provide a verified email");
  }

  let user = await User.findOne({ googleId: profile.sub });
  if (!user) {
    user = await User.findOne({ email: profile.email });
    if (user) {
      user.googleId = profile.sub;
      user.emailVerified = true;
      await user.save();
    } else {
      user = await User.create({
        googleId: profile.sub,
        name:
          typeof profile.name === "string" && profile.name.trim()
            ? profile.name.trim()
            : profile.email.split("@")[0],
        email: profile.email,
        emailVerified: true,
      });
    }
  }

  return {
    id: user._id,
    email: user.email,
    token: generateToken(user.email, user.targetRole),
  };
};
