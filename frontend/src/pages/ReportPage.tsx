import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {interviewService} from "@/services/interviewServices";

export default function ReportPage() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const data = await interviewService.generateReport(id);
      setReport(data);
    };

    fetchReport();
  }, [id]);

  if (!report) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Interview Report</h1>

      <p>Total Score: {report.totalScore}</p>
      <p>Average Score: {report.averageScore}</p>

      <div className="mt-6">
        <h2 className="font-semibold">Strengths</h2>
        <p>{report.strengths}</p>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold">Weaknesses</h2>
        <p>{report.weaknesses}</p>
      </div>
    </div>
  );
}