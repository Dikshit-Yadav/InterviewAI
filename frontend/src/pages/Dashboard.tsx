import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import ResumeBuilder from "@/components/dashboard/ResumeBuilder";
import ResumeActions from "@/components/interview/ResumeActions";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import PerformanceSection from "@/components/dashboard/PerformanceSection";
import ReportsSection from "@/components/dashboard/ReportsSection";
import HistorySection from "@/components/dashboard/HistorySection";
import PageSkeleton from "@/components/ui/PageSkeleton";
// import Skills from "@/components/dashboard/Skills";
import { getDashboard } from "@/services/dashboardService";
import { interviewService } from "@/services/interviewServices";
import type { DashboardData, InterviewHistoryItem } from "@/types/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pendingRedirect = sessionStorage.getItem("auth_redirect");
    if (pendingRedirect) {
      sessionStorage.removeItem("auth_redirect");
      navigate(pendingRedirect, { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const dash = await getDashboard();
        const hist = await interviewService.getHistory();

        setDashboardData(dash);
        setHistory(hist);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Could not load your dashboard. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <PageSkeleton page="dashboard" />;
  if (error || !dashboardData) {
    return (
      <div
        className="grid min-h-screen place-items-center bg-background px-6 text-center text-error"
        role="alert"
      >
        {error ?? "Dashboard data is unavailable."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNavbar />

      <div className="px-8 py-6 max-w-7xl mx-auto">
        <WelcomeHeader />

        <section className="my-8 rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Practice with your resume
            </h2>
            <p className="mt-1 text-sm text-100">
              Review your resume or start an interview with questions based on
              your experience and projects.
            </p>
          </div>
          <div className="mt-5">
            <ResumeActions />
          </div>
        </section>

        <ResumeBuilder />

        <StatsCards data={dashboardData} />
        {/* <Skills data={dashboardData.skillBreakdown} /> */}
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
