import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { interviewService } from "@/services/interviewServices";
import Nabar from "@/components/dashboard/DashboardNavbar";
import ScoreCard from "@/components/report/ScoreCard";
import StrengthWeakness from "@/components/report/StrengthWeakness";
import LearningPath from "@/components/report/LearningPath";
import TipsSection from "@/components/report/TipsSection";
import QuestionAnalysis from "@/components/report/QuestionAnalysis";
import PageSkeleton from "@/components/ui/PageSkeleton";

export default function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
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
      } catch (err: any) {
        console.error("Failed to load report", err);
        if (active) {
          setError(
            err?.response?.data?.message ||
              "Could not load this report. Please try again.",
          );
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
    <div className="bg-background text-foreground">
      <Nabar />

    <div className="min-h-screen bg-background text-foreground px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">

        <ScoreCard report={report} />

        <StrengthWeakness report={report} />

        <LearningPath report={report} />

        <TipsSection report={report} />

        <QuestionAnalysis report={report} />

      </div>
    </div>
    </div>
  );
}