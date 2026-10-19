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

    // sends ALL answers at once; backend evaluates them with AI and returns the report
    submitInterview: async (
        interviewId: string,
        answers: { questionId: string; answer: string }[]
    ) => {
        const res = await API.post(`/interview/submit/${interviewId}`, { answers });
        return res.data;
    },
    generateReport: async (interviewId: string) => {
        const res = await API.post(`/interview/generate-report/${interviewId}`);
        return res.data;
    },
    getHistory: async () => {
      const res = await API.get("/history");
      return res.data;
    },
}