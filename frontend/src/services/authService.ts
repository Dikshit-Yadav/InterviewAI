import { API, API_ENDPOINTS } from "../api/axios";
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
} from "../types/authType";
import {
    emailOnlySchema,
    emailOtpSchema,
    loginSchema,
    passwordResetSchema,
    registerSchema,
} from "@/lib/validation";

export const AuthService = {
    login: async (data: LoginRequest) => {
        const validated = loginSchema.parse(data);
        const res = await API.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, validated);
        return res.data;
    },

    register: async (data: RegisterRequest) => {
        const validated = registerSchema.parse(data);
        const res = await API.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, validated);
        return res.data;
    },

    sendRegistrationCode: async (email: string) => {
        const validated = emailOnlySchema.parse({ email });
        const res = await API.post(API_ENDPOINTS.AUTH.REGISTER_SEND_CODE, validated);
        return res.data;
    },

    verifyRegistrationCode: async (email: string, code: string) => {
        const validated = emailOtpSchema.parse({ email, code });
        const res = await API.post(API_ENDPOINTS.AUTH.REGISTER_VERIFY_CODE, validated);
        return res.data;
    },

    requestPasswordReset: async (email: string) => {
        const validated = emailOnlySchema.parse({ email });
        const res = await API.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, validated);
        return res.data;
    },

    resetPassword: async (email: string, code: string, password: string) => {
        const validated = passwordResetSchema.parse({ email, code, password });
        const res = await API.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, validated);
        return res.data;
    },

    isme: async () => {
        const res = await API.get<AuthResponse>(API_ENDPOINTS.AUTH.ME);
        return res.data;
    },

    logout: async () => {
        const res = await API.post(API_ENDPOINTS.AUTH.LOGOUT);
        return res.data;
    },

    googleLogin: () => {
        const baseURL = API.defaults.baseURL;
        if (!baseURL) {
            throw new Error("API URL is not configured");
        }
        window.location.assign(new URL(API_ENDPOINTS.AUTH.GOOGLE, baseURL).toString());
    },

};