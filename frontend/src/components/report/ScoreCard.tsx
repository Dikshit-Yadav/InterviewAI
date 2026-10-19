type Props = { report: any };

export default function ScoreCard({ report }: Props) {
  return (
    <div className="p-6 rounded-xl bg-surface border border-border">
      <h2 className="text-4xl font-bold tabular-nums">
        {report.averageScore}/10
      </h2>

      <p className="text-sm mt-2 text-text-secondary">
        {report.summary || "AI-generated performance summary"}
      </p>

      <div className="flex gap-4 mt-4 text-sm">
        <div className="bg-surface-hover px-3 py-2 rounded-md">
          Technical: {report.techScore || "-"}
        </div>
        <div className="bg-surface-hover px-3 py-2 rounded-md">
          Clarity: {report.clarityScore || "-"}
        </div>
        <div className="bg-surface-hover px-3 py-2 rounded-md">
          Confidence: {report.confidenceScore || "-"}
        </div>
      </div>
    </div>
  );
}