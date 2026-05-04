import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import PerformanceSection from "@/components/dashboard/PerformanceSection";
import ReportsSection from "@/components/dashboard/ReportsSection";
import HistorySection from "@/components/dashboard/HistorySection";
import Skills from "@/components/dashboard/Skills";
import { getDashboard } from "@/services/dashboardService";
import { interviewService } from "@/services/interviewServices";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dash = await getDashboard();
        const hist = await interviewService.getHistory();

        setDashboardData(dash);
        setHistory(hist);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    fetchData();
  }, []);

  if (!dashboardData) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b1a] via-[#0d0d2b] to-black text-white">
      <DashboardNavbar />

      <div className="px-8 py-6 max-w-7xl mx-auto">
        <WelcomeHeader />

        <StatsCards data={dashboardData} />
        <Skills data={dashboardData.skillBreakdown} />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <PerformanceSection reports={dashboardData.recentReports} />
          </div>

          <ReportsSection reports={dashboardData.recentReports} />
        </div>

        <HistorySection history={history} />
      </div>
    </div>
  );
}