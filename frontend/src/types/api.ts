export type DashboardReportSummary = {
  _id: string;
  averageScore: number;
};

export type SkillBreakdownItem = {
  skill: string;
  score: number;
};

export type DashboardData = {
  totalInterviews: number;
  avgScore: number;
  recentReports: DashboardReportSummary[];
  skillBreakdown: SkillBreakdownItem[];
};

export type InterviewHistoryItem = {
  _id: string;
  role: string;
  experience: string;
  interviewType: string;
  status: "started" | "completed";
  createdAt: string;
};

export type InterviewReportAnswer = {
  questionId?: string;
  question?: string;
  userAnswer?: string;
  aiEvaluation?: {
    score?: number;
    strengths?: string;
    weaknesses?: string;
    correctAnswer?: string;
  };
};

export type InterviewReport = {
  _id: string;
  averageScore: number;
  totalScore?: number;
  techScore?: number;
  clarityScore?: number;
  confidenceScore?: number;
  summary?: string;
  strongTopics: string[];
  weakTopics: string[];
  learningPath: string[];
  tips: string[];
  answers: InterviewReportAnswer[];
};
