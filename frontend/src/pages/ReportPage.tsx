import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Download, LayoutDashboard, ShieldAlert, Clock } from "lucide-react";
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
  const isTabSwitchTermination =
    searchParams.get("reason") === "tab_switch" || searchParams.get("cheating") === "true";

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
    const isNotFound = error.toLowerCase().includes("not found") || error.toLowerCase().includes("invalid");
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm" role="alert">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {isNotFound ? "Report Not Found" : "Unable to Load Report"}
          </h2>
          <p className="text-sm text-text-secondary">{error}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-brand-hover transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
            {id && !isNotFound && (
              <Link
                to={`/interview/${id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-hover transition-colors"
              >
                Return to interview
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }
  if (!report) return <PageSkeleton page="report" />;

  const isCheatingFlagged = report.cheatingDetected || isTabSwitchTermination;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground print:h-auto print:overflow-visible print:bg-white print:text-black">
      <div className="shrink-0 print:hidden">
        <Nabar />
      </div>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 print:overflow-visible print:h-auto">
        <div className="mx-auto max-w-5xl space-y-6 pb-12">
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 print:hidden">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Interview Performance Report</h1>
              <p className="text-sm text-secondary">
                Review your detailed scores, multi-criteria rubric evaluation, and AI feedback.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-surface-hover shadow-xs transition-colors cursor-pointer"
                title="Save or print report as PDF"
              >
                <Download className="h-4 w-4 text-brand" />
                <span>Download PDF</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:bg-brand-hover shadow-xs transition-colors cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>

          {/* Cheating Alert Banner */}
          {isCheatingFlagged && (
            <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-5 text-sm space-y-3">
              <div className="flex items-center gap-2.5 font-bold text-destructive text-base">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>CHEATING DETECTED &mdash; Interview Terminated Due to Proctoring Violations</span>
              </div>
              <p className="text-foreground text-xs sm:text-sm leading-relaxed">
                This assessment was automatically terminated because the allowable limit of 2 security warnings
                (tab switching or exiting full-screen mode) was reached. A malpractice penalty has been applied to the overall score, and only responses submitted prior to termination were evaluated.
              </p>

              {report.violations && report.violations.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-destructive/20">
                  {report.violations.map((v, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/15 px-3 py-1 text-xs font-mono font-semibold text-destructive"
                    >
                      <Clock className="h-3 w-3" />
                      <span>
                        Violation {idx + 1}: {v.type === "TAB_SWITCH" ? "Tab Switch / Window Inactive" : "Full-Screen Exit"}{" "}
                        ({new Date(v.timestamp).toLocaleTimeString()})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Score Card with Multi-criteria & Coding Rubric breakdown */}
          <ScoreCard report={report} />

          {/* Strengths & Weaknesses */}
          <StrengthWeakness report={report} />

          {/* Learning Path */}
          <LearningPath report={report} />

          {/* Tips Section */}
          <TipsSection report={report} />

          {/* Question by Question Analysis */}
          <QuestionAnalysis report={report} />
        </div>
      </main>
    </div>
  );
}
