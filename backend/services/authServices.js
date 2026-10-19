import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/jwt.js";

export const registerUser = async (name, email, password, targetRole) => {

   if (!name || !email || !password || !targetRole) {
      throw new Error("All fields required");
    }

  const exists = await User.findOne({ email });
  if (exists) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
     name,
      email,
      password: hashed,
      targetRole,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    targetRole: user.targetRole,
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");
  if (!user.password) throw new Error("This account uses Google sign-in");

  const match = await bcrypt.compare(password, user.password);

  if (!match) throw new Error("Invalid credentials");

  return {
    id: user._id,
    email: user.email,
    token: generateToken(user.email, user.targetRole),
  };
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
      await user.save();
    } else {
      user = await User.create({
        googleId: profile.sub,
        name:
          typeof profile.name === "string" && profile.name.trim()
            ? profile.name.trim()
            : profile.email.split("@")[0],
        email: profile.email,
      });
    }
  }

  return {
    id: user._id,
    email: user.email,
    token: generateToken(user.email, user.targetRole),
  };
};
