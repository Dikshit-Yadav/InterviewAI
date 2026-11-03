import React from "react";
import { Tag, Tooltip } from "antd";
import {
  ClockCircleOutlined,
  WarningOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import type { InterviewStage } from "@/types/api";

type Props = {
  role: string;
  stage: InterviewStage;
  remainingSeconds: number;
  violationCount: number;
  maxViolations?: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onFinishInterview: () => void;
  isSubmitting?: boolean;
};

const formatSeconds = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function InterviewHeaderBar({
  role,
  stage,
  remainingSeconds,
  violationCount,
  maxViolations = 2,
  isFullscreen,
  onToggleFullscreen,
  onFinishInterview,
  isSubmitting = false,
}: Props) {
  const isUrgent = remainingSeconds > 0 && remainingSeconds <= 300; // <= 5 mins

  const stageColorMap: Record<InterviewStage, string> = {
    Introduction: "blue",
    "Core Questions": "cyan",
    "Follow-up": "purple",
    "Coding Round": "orange",
    "Final Questions": "geekblue",
    Completed: "green",
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 sm:px-6 py-3 backdrop-blur-md text-foreground transition-colors">
      {/* Left: Role and Stage */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-primary-foreground font-bold text-xs tracking-wider shadow-xs">
            AI
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground leading-tight tracking-tight">
              {role || "Technical Interview"}
            </h2>
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
              AI-Proctored Technical Assessment
            </span>
          </div>
        </div>

        <Tag
          color={stageColorMap[stage] || "default"}
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold border"
        >
          {stage === "Coding Round" && <CodeOutlined className="mr-1" />}
          {stage}
        </Tag>
      </div>

      {/* Center: Proctoring Badge & Fullscreen Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Violation Count Badge */}
        <Tooltip title={`Recorded security warnings: ${violationCount}/${maxViolations}. Reaching ${maxViolations} terminates the session.`}>
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${
              violationCount === 0
                ? "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : violationCount === 1
                ? "border-amber-600/40 bg-amber-500/15 text-amber-800 dark:text-amber-300 animate-pulse"
                : "border-destructive bg-destructive/15 text-destructive"
            }`}
          >
            {violationCount === 0 ? (
              <CheckCircleOutlined className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <WarningOutlined />
            )}
            <span>Proctoring: {violationCount}/{maxViolations} Warnings</span>
          </div>
        </Tooltip>

        {/* Fullscreen indicator */}
        <Tooltip title={isFullscreen ? "Fullscreen active" : "Notice: Interview must remain in full-screen mode"}>
          <button
            onClick={onToggleFullscreen}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
              isFullscreen
                ? "border-border bg-surface-elevated text-foreground hover:bg-surface-hover"
                : "border-amber-500/50 bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold"
            }`}
          >
            {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            <span className="hidden md:inline">
              {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            </span>
          </button>
        </Tooltip>
      </div>

      {/* Right: Interview Timer and End Button */}
      <div className="flex items-center gap-2.5">
        {/* Timer */}
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-1 font-mono text-sm font-semibold tracking-wider ${
            isUrgent
              ? "border-destructive/60 bg-destructive/15 text-destructive animate-pulse"
              : "border-border bg-surface-elevated text-foreground"
          }`}
          title="Interview time remaining"
        >
          <ClockCircleOutlined className={isUrgent ? "text-destructive" : "text-muted-foreground"} />
          <span>{formatSeconds(remainingSeconds)}</span>
        </div>

        {/* End interview button */}
        <button
          onClick={onFinishInterview}
          disabled={isSubmitting}
          className="flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs sm:text-sm font-semibold px-3 py-1.5 transition cursor-pointer disabled:opacity-50"
        >
          <StopOutlined />
          <span>End</span>
        </button>
      </div>
    </header>
  );
}
