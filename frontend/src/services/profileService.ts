import { API } from "../api/axios";
import { profileSchema, type ProfileFormData } from "@/lib/validation";

export type UserProfile = {
  _id: string;
  name: string;
  email: string;
  targetRole: string;
  experience: string;
  education?: string;
  bio?: string;
  skills: string[];
  strongstSkill?: string;
  weakestSkill?: string;
  location?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  createdAt?: string;
};

export type ProfileStatsData = {
  totalInterviews: number;
  avgScore: number;
  completedInterviews: number;
  latestInterview: {
    _id: string;
    role: string;
    interviewType: string;
    createdAt: string;
    status: string;
  } | null;
};

export type ProfileResponse = {
  user: UserProfile;
  stats: ProfileStatsData;
};

export const getProfile = async (): Promise<ProfileResponse> => {
  const res = await API.get("/profile");
  return res.data;
};

export const updateProfile = async (
  data: ProfileFormData
): Promise<{ message: string; user: UserProfile }> => {
  const validated = profileSchema.parse(data);
  const res = await API.put("/profile/update", validated);
  return res.data;
};
