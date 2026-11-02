import React, { useState, useEffect, useRef } from "react";
import { Button, Tag, Select, Tooltip } from "antd";
import {
  CodeOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  SendOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";
import CodeEditor from "./CodeEditor";
import type { CodingQuestion, CodingEvaluation } from "@/types/api";

type Props = {
  codingQuestion: CodingQuestion | null;
  onSubmitCode: (code: string, language: string) => Promise<void>;
  isSubmitting?: boolean;
  evaluationResult?: CodingEvaluation | null;
  isFullWidth?: boolean;
  isTerminated?: boolean;
  onToggleFullWidth?: () => void;
};

const formatSeconds = (totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const languageOptions = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "sql", label: "SQL" },
];

export default function CodingWorkspace({
  codingQuestion,
  onSubmitCode,
  isSubmitting = false,
  evaluationResult = null,
  isFullWidth = false,
  isTerminated = false,
  onToggleFullWidth,
}: Props) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [remainingTime, setRemainingTime] = useState(1200);
  const [activeTab, setActiveTab] = useState<"problem" | "examples" | "evaluation">("problem");
  const hasAutoSubmittedRef = useRef(false);
  const timerHasTickedRef = useRef(false);

  // Sync starter code, language, and time limit when question changes
  useEffect(() => {
    if (codingQuestion) {
      setCode(codingQuestion.starterCode || "// Write your solution here\n");
      const detectedLang = codingQuestion.language
        ? codingQuestion.language.toLowerCase()
        : "javascript";
      setLanguage(detectedLang);
      setRemainingTime(
        codingQuestion.timeLimitSeconds && codingQuestion.timeLimitSeconds > 0
          ? codingQuestion.timeLimitSeconds
          : 1200
      );
      setActiveTab("problem");
      hasAutoSubmittedRef.current = false;
      timerHasTickedRef.current = false;
    }
  }, [codingQuestion]);

  // When evaluation result arrives, auto-switch to evaluation tab
  useEffect(() => {
    if (evaluationResult) {
      setActiveTab("evaluation");
    }
  }, [evaluationResult]);

  // Dedicated coding timer countdown - stops if session is terminated
  useEffect(() => {
    if (!codingQuestion || remainingTime <= 0 || isTerminated) return;

    const timer = setInterval(() => {
      timerHasTickedRef.current = true;
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [codingQuestion, remainingTime, isTerminated]);

  // Auto-submit code ONLY when coding timer actively ticks down to 0
  useEffect(() => {
    if (!codingQuestion || isTerminated) return;

    if (
      remainingTime <= 0 &&
      timerHasTickedRef.current &&
      !hasAutoSubmittedRef.current &&
      !isSubmitting
    ) {
      hasAutoSubmittedRef.current = true;
      const codeToSubmit =
        code.trim() || "// Auto-submitted upon time expiry: No solution entered";
      onSubmitCode(codeToSubmit, language);
    }
  }, [remainingTime, codingQuestion, code, language, isSubmitting, isTerminated, onSubmitCode]);

  const handleReset = () => {
    if (codingQuestion?.starterCode) {
      setCode(codingQuestion.starterCode);
    } else {
      setCode("// Write your solution here\n");
    }
  };

  const handleSubmit = async () => {
    const trimmed = code.trim();
    if (!trimmed || isSubmitting || remainingTime <= 0) return;
    await onSubmitCode(trimmed, language);
  };

  // When no coding question is active, display a clean placeholder
  if (!codingQuestion) {
    return (
      <div className="flex h-full flex-col items-center justify-center border-l border-border bg-background p-8 text-center text-foreground transition-colors">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface text-brand shadow-xs mb-4">
          <CodeOutlined className="text-3xl" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Coding Workspace Inactive
        </h3>
        <p className="mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
          The code editor will activate automatically when the AI interviewer assigns a practical coding challenge based on your technical discussion.
        </p>
        <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
          <InfoCircleOutlined className="text-brand" />
          <span>Continue the interview in the chat on the left</span>
        </div>
      </div>
    );
  }

  const isTimerExpired = remainingTime <= 0;
  const isTimerUrgent = remainingTime > 0 && remainingTime <= 180; // <= 3 mins

  // The editor is ONLY locked if the whole round timer has expired, actively sending a submission, or terminated.
  // Evaluation results NEVER lock the editor!
  const isEditorLocked = isSubmitting || isTimerExpired || isTerminated;

  // Reusable Description Pane Component
  const DescriptionPane = () => (
    <div className="h-full overflow-y-auto p-4 space-y-3 bg-surface text-foreground">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FileTextOutlined className="text-brand" />
          <span>
            {activeTab === "problem"
              ? "Problem Statement"
              : activeTab === "examples"
              ? "Test Examples"
              : "AI Evaluation Rubric"}
          </span>
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("problem")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
              activeTab === "problem"
                ? "bg-brand text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Problem
          </button>
          {codingQuestion.examples && codingQuestion.examples.length > 0 && (
            <button
              onClick={() => setActiveTab("examples")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                activeTab === "examples"
                  ? "bg-brand text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Examples ({codingQuestion.examples.length})
            </button>
          )}
          {evaluationResult && (
            <button
              onClick={() => setActiveTab("evaluation")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                activeTab === "evaluation"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-emerald-700 dark:text-emerald-400 font-medium"
              }`}
            >
              Rubric ({evaluationResult.score}/100)
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Problem Details & Constraints */}
      {activeTab === "problem" && (
        <div className="space-y-3 text-xs leading-relaxed text-foreground">
          <p className="whitespace-pre-wrap leading-relaxed">{codingQuestion.question}</p>

          {/* Constraints */}
          {codingQuestion.constraints && codingQuestion.constraints.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-3 space-y-1">
              <span className="font-bold text-foreground block">
                Constraints:
              </span>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {codingQuestion.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Rubric Criteria Tags */}
          {codingQuestion.evaluationCriteria && codingQuestion.evaluationCriteria.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground font-medium">Evaluation Criteria:</span>
              {codingQuestion.evaluationCriteria.map((crit, i) => (
                <Tag key={i} className="border bg-surface-elevated text-foreground text-[10px] px-2 py-0.5 rounded font-medium">
                  {crit}
                </Tag>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Test Examples */}
      {activeTab === "examples" && (
        <div className="space-y-2 text-xs">
          {codingQuestion.examples?.map((ex, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card p-3 space-y-1.5 font-mono text-[11px]"
            >
              <div className="text-foreground font-bold">
                Example {idx + 1}:
              </div>
              <div className="rounded bg-background p-2 border border-border/80">
                <span className="text-muted-foreground font-sans">Input: </span>
                <span className="text-amber-800 dark:text-amber-300 font-bold">{ex.input}</span>
              </div>
              <div className="rounded bg-background p-2 border border-border/80">
                <span className="text-muted-foreground font-sans">Output: </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{ex.output}</span>
              </div>
              {ex.explanation && (
                <div className="text-muted-foreground text-[11px] italic pt-0.5 font-sans">
                  {ex.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Evaluation Results */}
      {activeTab === "evaluation" && evaluationResult && (
        <div className="space-y-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs text-foreground">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircleOutlined />
              Rubric Assessment Score: {evaluationResult.score}/100
            </span>
            <Tag color={evaluationResult.score >= 70 ? "green" : "gold"} className="border font-bold">
              {evaluationResult.score >= 70 ? "Proficient" : "Needs Optimization"}
            </Tag>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg border border-border bg-card p-2.5">
              <span className="text-muted-foreground font-bold block">Time Complexity:</span>
              <span className="font-mono font-bold text-brand">{evaluationResult.timeComplexity?.complexity || "N/A"}</span>
              <p className="text-muted-foreground text-[10px] mt-0.5">{evaluationResult.timeComplexity?.feedback}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-2.5">
              <span className="text-muted-foreground font-bold block">Space Complexity:</span>
              <span className="font-mono font-bold text-brand">{evaluationResult.spaceComplexity?.complexity || "N/A"}</span>
              <p className="text-muted-foreground text-[10px] mt-0.5">{evaluationResult.spaceComplexity?.feedback}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-2.5 text-[11px]">
            <span className="text-muted-foreground font-bold block">Overall Feedback:</span>
            <p className="text-foreground mt-0.5 leading-relaxed">{evaluationResult.overallFeedback}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col border-l border-border bg-background text-foreground transition-colors">
      {/* Top Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface/90 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <CodeOutlined className="text-brand font-bold" />
          <span className="text-xs sm:text-sm font-bold text-foreground">
            {codingQuestion.title || "Coding Challenge"}
          </span>
          <Tag color={isTimerExpired ? "default" : "orange"} className="border text-xs px-2 rounded-full font-semibold">
            {isTimerExpired ? "Time Expired" : "Active Round"}
          </Tag>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Coding countdown timer */}
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono font-bold transition-colors ${
              isTimerExpired
                ? "border-destructive bg-destructive/15 text-destructive"
                : isTimerUrgent
                ? "border-destructive/60 bg-destructive/15 text-destructive animate-pulse"
                : "border-border bg-surface-elevated text-foreground"
            }`}
            title="Coding challenge remaining time"
          >
            <ClockCircleOutlined />
            <span>{isTimerExpired ? "00:00 (Expired)" : formatSeconds(remainingTime)}</span>
          </div>

          {/* Language selector */}
          <Select
            size="small"
            value={language}
            onChange={setLanguage}
            disabled={isEditorLocked}
            options={languageOptions}
            className="w-32 text-xs"
          />

          {/* Reset code */}
          <Tooltip title="Reset to starter code">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={isEditorLocked}
              className="border-border bg-surface-elevated text-foreground hover:bg-surface-hover cursor-pointer"
            />
          </Tooltip>

          {/* Full-width toggle button */}
          {onToggleFullWidth && (
            <Tooltip title={isFullWidth ? "Restore split view with chat" : "Expand code workspace to full screen"}>
              <button
                type="button"
                onClick={onToggleFullWidth}
                className="flex items-center gap-1 rounded-lg border border-border bg-surface-elevated hover:bg-surface-hover px-2.5 py-1 text-xs font-semibold text-foreground transition cursor-pointer"
              >
                {isFullWidth ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                <span className="hidden sm:inline">{isFullWidth ? "Split View" : "Expand Code"}</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Expiration or Evaluation Notice Banners */}
      {isTimerExpired && (
        <div className="border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-xs text-destructive flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined />
            <span><strong>Time Limit Reached:</strong> The coding round timer has expired. Solution was auto-submitted and editor is locked.</span>
          </div>
          <Tag color="red" className="border font-mono font-bold">LOCKED</Tag>
        </div>
      )}

      {evaluationResult && !isTimerExpired && (
        <div className="border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircleOutlined />
            <span><strong>Evaluated (Score: {evaluationResult.score}/100):</strong> You can review the rubric tab and continue editing or re-submit updated code below.</span>
          </div>
          <Tag color="green" className="border font-semibold">EDITABLE</Tag>
        </div>
      )}

      {/* Main workspace layout */}
      {isFullWidth ? (
        /* Full-width side-by-side mode: Description on Left (40%), Editor on Right (60%) */
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[40%] border-r border-border overflow-hidden flex flex-col">
            <DescriptionPane />
          </div>
          <div className="w-[60%] flex flex-col overflow-hidden p-3 bg-background">
            <div className="flex-1 overflow-hidden rounded-xl border border-border shadow-xs">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                readOnly={isEditorLocked}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Split mode: Description on Top (40%), Editor on Bottom (60%) */
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="max-h-[45%] overflow-y-auto border-b border-border">
            <DescriptionPane />
          </div>
          <div className="flex-1 p-3 min-h-[220px] bg-background">
            <div className="h-full rounded-xl border border-border overflow-hidden shadow-xs">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
                readOnly={isEditorLocked}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Submit Action Bar */}
      <div className="flex items-center justify-between border-t border-border bg-surface/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isEditorLocked ? (
            <>
              <LockOutlined className="text-muted-foreground" />
              <span>Editor locked (time expired).</span>
            </>
          ) : (
            <>
              <BulbOutlined className="text-brand font-bold" />
              <span className="hidden sm:inline">
                Evaluated against: Correctness, Time/Space Complexity, &amp; Code Quality.
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!code.trim() || isEditorLocked}
          className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-semibold transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isEditorLocked
              ? "bg-surface-elevated text-muted-foreground border border-border"
              : "bg-brand hover:bg-brand-hover text-primary-foreground"
          }`}
        >
          <SendOutlined />
          <span>
            {isSubmitting
              ? "Evaluating..."
              : isTimerExpired
              ? "Time Expired"
              : evaluationResult
              ? "Re-submit Solution"
              : "Submit Solution"}
          </span>
        </button>
      </div>
    </div>
  );
}
