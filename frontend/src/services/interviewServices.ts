import { API, API_ENDPOINTS } from "../api/axios";
import {
    interviewIdSchema,
    interviewStartSchema,
    submitAnswersSchema,
    type InterviewStartData,
} from "@/lib/validation";
import type {
    InterviewHistoryItem,
    InterviewReport,
} from "@/types/api";

export const interviewService = {
    startInterview: async (data: InterviewStartData) => {
        const validated = interviewStartSchema.parse(data);
        const res = await API.post(API_ENDPOINTS.INTERVIEW.START, validated);
        return res.data;
    },
    startFromResume: async (
        file: File,
        experience: string,
        interviewType: string
    ) => {
        const formData = new FormData();
        formData.append("resume", file);
        formData.append("experience", experience);
        formData.append("interviewType", interviewType);
        const res = await API.post(
            API_ENDPOINTS.INTERVIEW.START_FROM_RESUME,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return res.data as { interviewId: string; role: string };
    },
    reviewResume: async (file: File) => {
        const formData = new FormData();
        formData.append("resume", file);
        const res = await API.post(
            API_ENDPOINTS.INTERVIEW.REVIEW_RESUME,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return res.data as ResumeReview;
    },
    getQuestions: async (id: string) => {
        const validatedId = interviewIdSchema.parse(id);

        const res = await API.get(`/interview/questions/${validatedId}`);
        return res.data;
    },
    getAnswerFollowUp: async (
        interviewId: string,
        questionId: string,
        answer: string
    ) => {
        const validatedId = interviewIdSchema.parse(interviewId);
        const response = await API.post(
            `${API_ENDPOINTS.INTERVIEW.FOLLOW_UP}/${validatedId}`,
            { questionId, answer }
        );
        return response.data as {
            followUp: { _id: string; questionText: string; order: number } | null;
        };
    },
    resolveTechnologies: async (
        interviewId: string,
        questionId: string,
        technologies: string
    ) => {
        const validatedId = interviewIdSchema.parse(interviewId);
        const response = await API.post(
            `/interview/technologies/${validatedId}`,
            { questionId, technologies }
        );
        return response.data as {
            _id: string;
            questionText: string;
            order: number;
            followUpToQuestionId?: string;
            isTechnologyClarification?: boolean;
        }[];
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
    generateReport: async (interviewId: string): Promise<InterviewReport> => {
        const validatedId = interviewIdSchema.parse(interviewId);
        const res = await API.post(`/interview/generate-report/${validatedId}`);
        return res.data;
    },
    getHistory: async (): Promise<InterviewHistoryItem[]> => {
      const res = await API.get("/history");
      return res.data;
    },
}

export interface ResumeReview {
    summary: string;
    atsScore: number | null;
    strengths: string[];
    improvements: string[];
    formattingSuggestions: string[];
    keywordsToConsider: string[];
    learningTopics: string[];
    practiceQuestions: string[];
    bulletSuggestions: { original: string; suggestion: string }[];
}