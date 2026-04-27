import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import PerformanceSection from "@/components/dashboard/PerformanceSection";
import ReportsSection from "@/components/dashboard/ReportsSection";
import HistorySection from "@/components/dashboard/HistorySection";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0b1a] via-[#0d0d2b] to-black text-white">
      
      <DashboardNavbar />

      <div className="px-8 py-6 max-w-7xl mx-auto">
        <WelcomeHeader />
        <StatsCards />

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <PerformanceSection />
          </div>
          <ReportsSection />
        </div>

        <HistorySection />
      </div>
    </div>
  );
}