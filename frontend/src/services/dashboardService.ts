import { API } from "../api/axios";
import type { DashboardData } from "@/types/api";

export const getDashboard = async (): Promise<DashboardData> => {
  const res = await API.get("/dashboard");
  return res.data;
};
