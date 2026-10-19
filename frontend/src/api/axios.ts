import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
  },


}