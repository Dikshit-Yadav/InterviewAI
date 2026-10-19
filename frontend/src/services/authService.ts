import { API, API_ENDPOINTS } from "../api/axios";
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
} from "../types/authType";
import { loginSchema, registerSchema } from "@/lib/validation";

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