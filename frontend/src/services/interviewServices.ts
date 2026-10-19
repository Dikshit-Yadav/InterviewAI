import { API, API_ENDPOINTS } from "../api/axios";
import {
    interviewIdSchema,
    interviewStartSchema,
    submitAnswersSchema,
    type InterviewStartData,
} from "@/lib/validation";

export const interviewService = {
    startInterview: async (data: InterviewStartData) => {
        const validated = interviewStartSchema.parse(data);
        const res = await API.post(API_ENDPOINTS.INTERVIEW.START, validated);
        return res.data;
    },
    getQuestions: async (id: string) => {
        const validatedId = interviewIdSchema.parse(id);

        const res = await API.get(`/interview/questions/${validatedId}`);
        return res.data;
    },

    // sends ALL answers at once; backend evaluates them with AI and returns the report
    submitInterview: async (
        interviewId: string,
        answers: { questionId: string; answer: string }[]
    ) => {
        const validatedId = interviewIdSchema.parse(interviewId);
        const validatedAnswers = submitAnswersSchema.parse({ answers });
        const res = await API.post(`/interview/submit/${validatedId}`, validatedAnswers);
        return res.data;
    },
    generateReport: async (interviewId: string) => {
        const validatedId = interviewIdSchema.parse(interviewId);
        const res = await API.post(`/interview/generate-report/${validatedId}`);
        return res.data;
    },
    getHistory: async () => {
      const res = await API.get("/history");
      return res.data;
    },
}