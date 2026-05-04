import { API } from "../api/axios";

export const getDashboard = async () => {
  const res = await API.get("/dashboard");
  return res.data;
};
