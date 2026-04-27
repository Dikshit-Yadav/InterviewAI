import { API, API_ENDPOINTS } from "../api/axios";
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
} from "../types/authType";

export const AuthService = {
    login: async (data: LoginRequest) => {
        const res = await API.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
        return res.data;
    },

    register: async (data: RegisterRequest) => {
        const res = await API.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
        return res.data;
    },

    isme: async () => {
        const res = await API.get<AuthResponse>(API_ENDPOINTS.AUTH.ME);
        return res.data;
    },

};