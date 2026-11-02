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
  status: "started" | "completed" | "terminated" | "expired";
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

export type CodingEvaluation = {
  questionId: string;
  status?: string;
  score: number;
  correctness: {
    score: number;
    feedback: string;
  };
  timeComplexity: {
    complexity: string;
    feedback: string;
  };
  spaceComplexity: {
    complexity: string;
    feedback: string;
  };
  codeQuality: {
    score: number;
    feedback: string;
  };
  edgeCases: {
    score: number;
    feedback: string;
  };
  overallFeedback: string;
};

export type InterviewViolation = {
  type: "TAB_SWITCH" | "FULLSCREEN_EXIT";
  timestamp: string;
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

  // Enhanced report fields
  cheatingDetected?: boolean;
  violationCount?: number;
  violations?: InterviewViolation[];
  interviewStatus?: string;
  terminationReason?: string | null;
  overallScore?: number;
  technicalKnowledge?: number;
  communication?: number;
  problemSolving?: number;
  codingPerformance?: number;
  codeQuality?: number;
  codingEvaluations?: CodingEvaluation[];
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  finalFeedback?: string;
};

export type ChatMessageType =
  | "INTERVIEW_QUESTION"
  | "CODING_QUESTION"
  | "ANSWER"
  | "CODE_SUBMISSION"
  | "SYSTEM_NOTIFICATION"
  | "INTERVIEW_REJECTED";

export type ChatMessage = {
  id: string;
  role: "ai" | "candidate" | "system";
  type: ChatMessageType;
  content: string;
  timestamp: string | Date;
  isFollowUp?: boolean;
  isUnprofessional?: boolean;
  questionId?: string;
  metadata?: Record<string, unknown>;
};

export type CodingExample = {
  input: string;
  output: string;
  explanation?: string;
};

export type CodingQuestion = {
  questionId: string;
  title?: string;
  question: string;
  language: string;
  timeLimitSeconds: number;
  constraints?: string[];
  examples?: CodingExample[];
  starterCode?: string;
  evaluationCriteria?: string[];
};

export type InterviewStage =
  | "Introduction"
  | "Core Questions"
  | "Follow-up"
  | "Coding Round"
  | "Final Questions"
  | "Completed";
