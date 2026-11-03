import React from "react";
import { WarningOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

type Props = {
  open: boolean;
  violationType: "TAB_SWITCH" | "FULLSCREEN_EXIT" | string;
  violationCount: number;
  maxViolations?: number;
  onAcknowledge: () => void;
};

export default function ViolationWarningModal({
  open,
  violationType,
  violationCount,
  maxViolations = 2,
  onAcknowledge,
}: Props) {
  if (!open) return null;

  const violationLabel =
    violationType === "TAB_SWITCH"
      ? "Tab Switch / Window Inactive"
      : violationType === "FULLSCREEN_EXIT"
      ? "Full-Screen Mode Exited"
      : "Proctoring Violation";

  const description =
    violationType === "TAB_SWITCH"
      ? "You navigated away from the interview tab or switched windows. The assessment environment monitors focus at all times."
      : "You exited full-screen mode. The technical assessment must remain in full-screen mode throughout its duration.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg rounded-2xl border border-destructive/40 bg-card p-6 shadow-2xl space-y-5 text-foreground">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
            <WarningOutlined className="text-xl" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Security Warning ({violationCount}/{maxViolations})
            </h3>
            <span className="text-xs text-muted-foreground">Proctoring Boundary Triggered</span>
          </div>
        </div>

        {/* Violation info card */}
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs space-y-1.5">
          <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-sm">
            <ExclamationCircleOutlined />
            <span>{violationLabel}</span>
          </div>
          <p className="text-foreground leading-relaxed">{description}</p>
        </div>

        {/* Strict 2-violation notice */}
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-foreground space-y-1">
          <p className="font-bold text-destructive">
            Critical Policy Enforcement:
          </p>
          <p className="leading-relaxed">
            You have used <strong className="text-destructive font-bold">{violationCount} of {maxViolations}</strong> allowable warnings. 
            A second violation will <strong>immediately terminate</strong> your assessment, mark the attempt as malpractice, and lock you out.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onAcknowledge}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-hover text-primary-foreground py-3 text-sm font-semibold shadow-md transition cursor-pointer"
        >
          <span>I Understand &amp; Return to Fullscreen</span>
        </button>
      </div>
    </div>
  );
}
