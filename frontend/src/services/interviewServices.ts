import { API, API_ENDPOINTS } from "../api/axios";

export const interviewService = {
    startInterview: async (data: any) => {
        const res = await API.post(API_ENDPOINTS.INTERVIEW.START, data);
        return res.data;
    },
    getQuestions: async (id: string) => {
        if (!id) throw new Error("Interview ID missing");

        const res = await API.get(`/interview/questions/${id}`);
        return res.data;
    },

    submitAnswer: async (data: any) => {
        const res = await API.post("/interview/submit-answer", data);
        return res.data;
    },
    generateReport: async (interviewId: string) => {
        const res = await API.post(`/interview/generate-report/${interviewId}`);
        return res.data;
    },
}