import { useEffect, useState } from "react";
import { getDashboard } from "@/services/dashboardService";

export default function ProfileStats() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getDashboard().then(setData);
  }, []);

  if (!data) return null;

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
      <h3 className="mb-4 font-semibold">Your Stats</h3>

      <p>Total Interviews: {data.totalInterviews}</p>
      <p>Average Score: {data.avgScore?.toFixed(1)}</p>
    </div>
  );
}