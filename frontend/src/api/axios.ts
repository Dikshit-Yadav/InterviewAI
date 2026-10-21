import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiBaseUrl =
  configuredApiUrl || (import.meta.env.DEV ? "http://localhost:4300" : "/api");

export const API = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REGISTER_SEND_CODE: "/auth/register/send-code",
    REGISTER_VERIFY_CODE: "/auth/register/verify-code",
    FORGOT_PASSWORD: "/auth/password/forgot",
    RESET_PASSWORD: "/auth/password/reset",
    GOOGLE: "/auth/google",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },
  INTERVIEW: {
    START: "/interview/start",
    START_FROM_RESUME: "/interview/start-from-resume",
    REVIEW_RESUME: "/interview/review-resume",
    FOLLOW_UP: "/interview/follow-up",
  },


}