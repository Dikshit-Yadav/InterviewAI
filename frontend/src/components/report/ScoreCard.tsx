import type { InterviewReport } from "@/types/api";
import { Code2, ShieldAlert } from "lucide-react";

type Props = { report: InterviewReport };

export default function ScoreCard({ report }: Props) {
  const hasCoding = report.codingPerformance !== undefined && report.codingPerformance > 0;
  const displayScore = report.overallScore !== undefined ? report.overallScore : Math.round((report.averageScore || 0) * 10);

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
            Overall Assessment Score
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-5xl font-extrabold tabular-nums text-foreground tracking-tight">
              {displayScore}
            </h2>
            <span className="text-lg text-muted-foreground font-semibold">/ 100</span>
          </div>
        </div>

        {report.cheatingDetected && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
            <ShieldAlert className="h-4 w-4" />
            <span>Integrity Penalty Applied</span>
          </div>
        )}
      </div>

      <p className="text-sm leading-relaxed text-text-secondary">
        {report.summary || report.finalFeedback || "AI-generated performance summary"}
      </p>

      {/* Multi-Criteria Score Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2 text-xs">
        <div className="bg-surface-elevated border border-border p-3 rounded-xl space-y-1">
          <span className="text-muted-foreground block font-medium">Technical</span>
          <span className="font-bold text-base text-foreground font-mono">
            {report.technicalKnowledge ?? (report.techScore ? Math.round(report.techScore * 10) : "-")}
            <span className="text-[10px] text-muted-foreground font-normal">/100</span>
          </span>
        </div>

        <div className="bg-surface-elevated border border-border p-3 rounded-xl space-y-1">
          <span className="text-muted-foreground block font-medium">Communication</span>
          <span className="font-bold text-base text-foreground font-mono">
            {report.communication ?? (report.clarityScore ? Math.round(report.clarityScore * 10) : "-")}
            <span className="text-[10px] text-muted-foreground font-normal">/100</span>
          </span>
        </div>

        <div className="bg-surface-elevated border border-border p-3 rounded-xl space-y-1">
          <span className="text-muted-foreground block font-medium">Problem Solving</span>
          <span className="font-bold text-base text-foreground font-mono">
            {report.problemSolving ?? (report.confidenceScore ? Math.round(report.confidenceScore * 10) : "-")}
            <span className="text-[10px] text-muted-foreground font-normal">/100</span>
          </span>
        </div>

        {hasCoding && (
          <>
            <div className="bg-surface-elevated border border-border p-3 rounded-xl space-y-1">
              <span className="text-muted-foreground block font-medium flex items-center gap-1">
                <Code2 className="h-3 w-3 text-brand" />
                Coding
              </span>
              <span className="font-bold text-base text-brand font-mono">
                {report.codingPerformance}
                <span className="text-[10px] text-muted-foreground font-normal">/100</span>
              </span>
            </div>

            <div className="bg-surface-elevated border border-border p-3 rounded-xl space-y-1">
              <span className="text-muted-foreground block font-medium">Code Quality</span>
              <span className="font-bold text-base text-foreground font-mono">
                {report.codeQuality ?? "-"}
                <span className="text-[10px] text-muted-foreground font-normal">/100</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Coding rubric evaluations card if present */}
      {report.codingEvaluations && report.codingEvaluations.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4 space-y-2 text-xs">
          <h4 className="font-bold text-foreground flex items-center gap-1.5">
            <Code2 className="h-4 w-4 text-brand" />
            Coding Round Rubric Breakdown
          </h4>
          {report.codingEvaluations.map((ev, idx) => (
            <div key={idx} className="space-y-1.5 pt-1 border-t border-border/60">
              <div className="flex items-center justify-between font-semibold">
                <span>Challenge Solution #{idx + 1}</span>
                <span className="text-brand font-mono font-bold">{ev.score}/100</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                <div>
                  <strong className="text-foreground">Time Complexity:</strong>{" "}
                  <span className="font-mono">{ev.timeComplexity?.complexity || "N/A"}</span> &mdash;{" "}
                  {ev.timeComplexity?.feedback}
                </div>
                <div>
                  <strong className="text-foreground">Space Complexity:</strong>{" "}
                  <span className="font-mono">{ev.spaceComplexity?.complexity || "N/A"}</span> &mdash;{" "}
                  {ev.spaceComplexity?.feedback}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
