import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { interviewService } from "@/services/interviewServices";
import Nabar from "@/components/dashboard/DashboardNavbar";
import ScoreCard from "@/components/report/ScoreCard";
import StrengthWeakness from "@/components/report/StrengthWeakness";
import LearningPath from "@/components/report/LearningPath";
import TipsSection from "@/components/report/TipsSection";
import QuestionAnalysis from "@/components/report/QuestionAnalysis";

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
      } catch (err) {
        console.error("Failed to load report", err);
        if (active) setError("Could not load this report. Please try again.");
      }
    };

    fetchReport();
    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <p className="text-white p-10">{error}</p>;
  if (!report) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="bg-gradient-to-b from-[#0b0b1a] via-[#0d0d2b] to-black text-white"> 
      <Nabar />

    <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
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