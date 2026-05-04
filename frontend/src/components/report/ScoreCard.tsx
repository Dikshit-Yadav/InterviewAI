type Props = { report: any };

export default function ScoreCard({ report }: Props) {
  return (
    <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500">
      <h2 className="text-4xl font-bold">
        {report.averageScore}/10
      </h2>

      <p className="text-sm mt-2 text-white/80">
        {report.summary || "AI-generated performance summary"}
      </p>

      <div className="flex gap-4 mt-4 text-sm">
        <div className="bg-white/10 px-3 py-2 rounded">
          Technical: {report.techScore || "-"}
        </div>
        <div className="bg-white/10 px-3 py-2 rounded">
          Clarity: {report.clarityScore || "-"}
        </div>
        <div className="bg-white/10 px-3 py-2 rounded">
          Confidence: {report.confidenceScore || "-"}
        </div>
      </div>
    </div>
  );
}