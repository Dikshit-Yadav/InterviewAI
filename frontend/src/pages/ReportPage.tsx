import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Download, LayoutDashboard, ShieldAlert } from "lucide-react";
import { interviewService } from "@/services/interviewServices";
import Nabar from "@/components/dashboard/DashboardNavbar";
import ScoreCard from "@/components/report/ScoreCard";
import StrengthWeakness from "@/components/report/StrengthWeakness";
import LearningPath from "@/components/report/LearningPath";
import TipsSection from "@/components/report/TipsSection";
import QuestionAnalysis from "@/components/report/QuestionAnalysis";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { getErrorMessage } from "@/lib/apiError";
import type { InterviewReport } from "@/types/api";

export default function ReportPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isAutoSubmitted = searchParams.get("reason") === "tab_switch";

  const [report, setReport] = useState<InterviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchReport = async () => {
      if (!id) {
        setError("Invalid report id.");
        return;
      }

      try {
        const data = await interviewService.generateReport(id);
        if (active) setReport(data);
      } catch (err: unknown) {
        console.error("Failed to load report", err);
        if (active) {
          setError(getErrorMessage(err, "Could not load this report. Please try again."));
        }
      }
    };

    fetchReport();
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div className="space-y-4" role="alert">
          <p className="text-error">{error}</p>
          {id && (
            <Link
              to={`/interview/${id}`}
              className="inline-flex rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover"
            >
              Return to interview
            </Link>
          )}
        </div>
      </div>
    );
  }
  if (!report) return <PageSkeleton page="report" />;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <div className="shrink-0 print:hidden">
        <Nabar />
      </div>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 print:overflow-visible print:h-auto">
        <div className="mx-auto max-w-5xl space-y-6 pb-12">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 print:hidden">
            <div>
              <h1 className="text-2xl font-bold">Interview Performance Report</h1>
              <p className="text-sm text-secondary">
                Review your detailed scores, strengths, and AI recommendations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground hover:bg-surface-hover shadow-sm transition-colors cursor-pointer"
                title="Save or print report as PDF"
              >
                <Download className="h-4 w-4 text-brand" />
                <span>Save Report</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-brand-hover shadow-sm transition-colors cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>

          {isAutoSubmitted && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>
                Your interview was submitted automatically because the maximum allowed tab switches (3/3) were reached.
              </span>
            </div>
          )}

          <ScoreCard report={report} />

          <StrengthWeakness report={report} />

          <LearningPath report={report} />

          <TipsSection report={report} />

          <QuestionAnalysis report={report} />
        </div>
      </main>
    </div>
  );
}
