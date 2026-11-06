import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal } from "antd";
import {
  ExclamationCircleOutlined,
  CodeOutlined,
  PlayCircleOutlined,
  ShieldCheckOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import InterviewHeaderBar from "@/components/session/InterviewHeaderBar";
import InterviewChat from "@/components/session/InterviewChat";
import CodingWorkspace from "@/components/session/CodingWorkspace";
import ViolationWarningModal from "@/components/session/ViolationWarningModal";
import CheaterDetectedScreen from "@/components/session/CheaterDetectedScreen";

import { interviewService } from "@/services/interviewServices";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { getErrorMessage } from "@/lib/apiError";
import type {
  ChatMessage,
  CodingQuestion,
  CodingEvaluation,
  InterviewStage,
} from "@/types/api";

type Question = {
  _id: string;
  questionText: string;
  order: number;
  followUpToQuestionId?: string;
  isTechnologyClarification?: boolean;
};

type ViolationLog = {
  type: string;
  timestamp: string | Date;
};

const MAX_VIOLATIONS = 2;
const TOTAL_INTERVIEW_SECONDS = 30 * 60; // 30 minutes

export default function SessionPage() {
  const navigate = useNavigate();
  const { interviewId } = useParams<{ interviewId: string }>();

  // Core interview state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [interviewRole, setInterviewRole] = useState("Technical Interview");
  const [currentStage, setCurrentStage] = useState<InterviewStage>("Introduction");

  // Conversation history
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Coding round state
  const [activeCodingQuestion, setActiveCodingQuestion] = useState<CodingQuestion | null>(null);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [codingEvaluation, setCodingEvaluation] = useState<CodingEvaluation | null>(null);

  // Layout resizing state (draggable columns)
  const [chatWidthPercent, setChatWidthPercent] = useState(48); // 48% Chat, 52% Code
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [isCodeFullWidth, setIsCodeFullWidth] = useState(false);

  // Timer state
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_INTERVIEW_SECONDS);

  // Proctoring & Violations state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [cheatingDetected, setCheatingDetected] = useState(false);
  const [violationLogs, setViolationLogs] = useState<ViolationLog[]>([]);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [currentViolationType, setCurrentViolationType] = useState<string>("TAB_SWITCH");
  const lastViolationTimeRef = useRef<number>(0);
  const proctoringArmedRef = useRef<boolean>(false);
  const submissionLockRef = useRef<boolean>(false);

  // Professional Conduct & Strikes state
  const [unprofessionalStrikes, setUnprofessionalStrikes] = useState(0);
  const [isTerminatedUnprofessional, setIsTerminatedUnprofessional] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);
  const [notFoundError, setNotFoundError] = useState<string | null>(null);

  // Load and hydrate interview session state from backend
  useEffect(() => {
    if (!interviewId) return;

    const loadInterview = async () => {
      try {
        setLoadingQuestions(true);

        try {
          const [state, data] = await Promise.all([
            interviewService.getSessionState(interviewId),
            interviewService.getQuestions(interviewId).catch(() => []),
          ]);

          if (Array.isArray(data) && data.length > 0) {
            setQuestions(data);
          }

          setInterviewRole(state.role || "Technical Interview");
          setRemainingSeconds(
            state.remainingSeconds > 0 ? state.remainingSeconds : TOTAL_INTERVIEW_SECONDS
          );
          setViolationCount(state.violationCount || 0);
          setUnprofessionalStrikes(state.unprofessionalStrikes || 0);

          if (state.conversationHistory && state.conversationHistory.length > 0) {
            setMessages(state.conversationHistory);
            const lastMsg = state.conversationHistory[state.conversationHistory.length - 1];
            if (lastMsg.type === "CODING_QUESTION") {
              setCurrentStage("Coding Round");
            } else if (lastMsg.isFollowUp) {
              setCurrentStage("Follow-up");
            } else if (state.conversationHistory.length > 1) {
              setCurrentStage("Core Questions");
            }
          }
          if (state.activeCodingQuestion) {
            setActiveCodingQuestion(state.activeCodingQuestion);
            setCurrentStage("Coding Round");
          }
          if (state.status === "terminated") {
            if (state.terminationReason === "UNPROFESSIONAL_CONDUCT") {
              setIsTerminatedUnprofessional(true);
              setTerminationReason("UNPROFESSIONAL_CONDUCT");
              setCurrentStage("Completed");
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
                setIsFullscreen(false);
              }
            } else {
              setCheatingDetected(true);
              setViolationCount(Math.max(2, state.violationCount || 2));
              return;
            }
          } else if (state.cheatingDetected || (state.violationCount || 0) >= MAX_VIOLATIONS) {
            setCheatingDetected(true);
            setViolationCount(Math.max(2, state.violationCount || 2));
            return;
          }
          if (state.status === "completed") {
            await interviewService.submitInterview(interviewId, []);
            navigate(`/report/${interviewId}`);
            return;
          }
        } catch {
          // Fallback to questions loading
          const data = await interviewService.getQuestions(interviewId);
          setQuestions(data);
          if (data.length > 0) {
            const firstText = data[0].questionText;
            const match = firstText.match(/related to (.+?)\./i);
            if (match && match[1]) {
              setInterviewRole(match[1]);
            }
          }
        }
      } catch (err: unknown) {
        console.error("Failed to load interview session:", err);
        const errMsg = getErrorMessage(err, "Interview session could not be found.");
        setNotFoundError(errMsg);
        toast.error(errMsg);
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadInterview();
  }, [interviewId, navigate]);

  // Finalize and submit answers, then navigate to report
  const submitAndRedirect = useCallback(
    async (reason?: string) => {
      if (submitting || !interviewId) return;
      setSubmitting(true);

      try {
        // The server constructs report entries from its persisted conversation.
        // Do not fill gaps from the preloaded question list in the UI.
        await interviewService.submitInterview(interviewId, []);

        const queryParams = new URLSearchParams();
        if (reason) queryParams.set("reason", reason);
        if (violationCount >= MAX_VIOLATIONS || reason === "tab_switch") {
          queryParams.set("cheating", "true");
        }

        const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
        navigate(`/report/${interviewId}${queryStr}`);
      } catch (err) {
        console.error("Submission error:", err);
        const queryParams = new URLSearchParams();
        if (reason) queryParams.set("reason", reason);
        if (violationCount >= MAX_VIOLATIONS || reason === "tab_switch") {
          queryParams.set("cheating", "true");
        }
        const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
        navigate(`/report/${interviewId}${queryStr}`);
      } finally {
        setSubmitting(false);
      }
    },
    [interviewId, navigate, submitting, violationCount]
  );

  const handleAutoSubmit = useCallback(
    async (reason: "timeout" | "tab_switch") => {
      if (submitting || !interviewId) return;
      toast.warn(
        reason === "timeout"
          ? "Interview duration expired. Finalizing your interview assessment..."
          : "Proctoring violation recorded.",
        { autoClose: 3500 }
      );
      await submitAndRedirect(reason);
    },
    [interviewId, submitAndRedirect, submitting]
  );

  // Record a proctoring violation (debounced and reported to backend)
  const recordViolation = useCallback(
    async (type: "TAB_SWITCH" | "FULLSCREEN_EXIT") => {
      if (
        !interviewStarted ||
        submitting ||
        submissionLockRef.current ||
        !interviewId ||
        cheatingDetected ||
        isTerminatedUnprofessional
      )
        return;

      const now = Date.now();
      if (now - lastViolationTimeRef.current < 1800) return;
      lastViolationTimeRef.current = now;

      setCurrentViolationType(type);
      setViolationLogs((prev) => [...prev, { type, timestamp: new Date() }]);

      try {
        const res = await interviewService.logInterviewViolation(interviewId, type);
        const nextCount = res.violationCount;
        setViolationCount(nextCount);

        if (nextCount === 1) {
          setWarningModalOpen(true);
        } else if (nextCount >= MAX_VIOLATIONS || res.cheatingDetected) {
          submissionLockRef.current = true;
          setCheatingDetected(true);
          setWarningModalOpen(false);
          toast.error("Malpractice detected: 2 security violations recorded. Interview is terminated.", {
            autoClose: 5000,
          });
          // Background sync to ensure report has cheating flags
          submitAndRedirect("tab_switch").catch(() => {});
        }
      } catch {
        setViolationCount((prev) => {
          const next = prev + 1;
          if (next === 1) setWarningModalOpen(true);
          if (next >= MAX_VIOLATIONS) {
            submissionLockRef.current = true;
            setCheatingDetected(true);
            setWarningModalOpen(false);
            submitAndRedirect("tab_switch").catch(() => {});
          }
          return next;
        });
      }
    },
    [interviewId, interviewStarted, submitting, cheatingDetected, isTerminatedUnprofessional, submitAndRedirect]
  );

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);

      // If user exited fullscreen during active interview, record violation
      if (
        !active &&
        interviewStarted &&
        proctoringArmedRef.current &&
        !cheatingDetected &&
        !isTerminatedUnprofessional
      ) {
        recordViolation("FULLSCREEN_EXIT");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [interviewStarted, recordViolation, cheatingDetected, isTerminatedUnprofessional]);

  // Overall timer countdown - stops completely if terminated or completed
  useEffect(() => {
    if (!interviewStarted || submitting || cheatingDetected || isTerminatedUnprofessional) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted, submitting, handleAutoSubmit, cheatingDetected, isTerminatedUnprofessional]);

  // Arm proctoring after a grace period once interview begins
  useEffect(() => {
    if (!interviewStarted) return;

    const graceTimer = setTimeout(() => {
      proctoringArmedRef.current = true;
    }, 2500);

    return () => clearTimeout(graceTimer);
  }, [interviewStarted]);

  // Tab switch detection via visibilitychange and window blur
  useEffect(() => {
    if (!interviewStarted || submitting || cheatingDetected || isTerminatedUnprofessional) return;

    const handleVisibilityChange = () => {
      if (document.hidden && proctoringArmedRef.current) {
        recordViolation("TAB_SWITCH");
      }
    };

    const handleWindowBlur = () => {
      if (proctoringArmedRef.current) {
        recordViolation("TAB_SWITCH");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [interviewStarted, submitting, recordViolation, cheatingDetected, isTerminatedUnprofessional]);

  // Anti-Cheating & Malpractice Protection:
  // 1. Strictly block Copy (Ctrl+C, Cmd+C, copy event) everywhere
  // 2. Strictly block Paste (Ctrl+V, Cmd+V, paste event) everywhere
  // 3. Strictly block Cut (Ctrl+X, Cmd+X, cut event)
  // 4. Block Developer Tools & Inspection (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
  // 5. Block Context Menu (right click)
  // 6. Block Drag & Drop of text
  useEffect(() => {
    if (!interviewStarted || cheatingDetected) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.clipboardData) {
        e.clipboardData.clearData();
      }
      toast.warn("Copying is strictly prohibited during the proctored assessment.", {
        toastId: "copy-blocked",
      });
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.clipboardData) {
        e.clipboardData.clearData();
      }
      toast.warn("Pasting external content is strictly prohibited during the assessment.", {
        toastId: "paste-blocked",
      });
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      toast.warn("Cut action is disabled during the assessment.", {
        toastId: "cut-blocked",
      });
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        toast.warn("Developer tools are prohibited during the technical assessment.");
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "U" || e.key === "u")
      ) {
        e.preventDefault();
        toast.warn("Inspection and developer shortcuts are prohibited during the assessment.");
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        toast.warn("Copying is disabled during this proctored assessment.", {
          toastId: "copy-blocked",
        });
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V")) {
        e.preventDefault();
        toast.warn("Pasting external content is prohibited during the assessment.", {
          toastId: "paste-blocked",
        });
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "x" || e.key === "X")) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("paste", handlePaste, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("dragstart", handleDragStart, true);
    document.addEventListener("drop", handleDrop, true);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("paste", handlePaste, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      document.removeEventListener("drop", handleDrop, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [interviewStarted, cheatingDetected]);

  // Draggable Divider Mouse Listeners
  useEffect(() => {
    if (!isDraggingDivider) return;

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const newPercent = (e.clientX / windowWidth) * 100;
      // Clamp chat width between 25% and 75%
      setChatWidthPercent(Math.min(75, Math.max(25, newPercent)));
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingDivider]);

  // Begin Interview button click handler: Enters full screen on documentElement
  const handleBeginInterview = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }

    setInterviewStarted(true);

    if (messages.length === 0) {
      if (questions.length > 0) {
        const firstQ = questions[0];
        setMessages([
          {
            id: `ai-${firstQ._id}`,
            role: "ai",
            type: "INTERVIEW_QUESTION",
            content: firstQ.questionText,
            timestamp: new Date(),
            questionId: firstQ._id,
          },
        ]);
      } else {
        const defaultIntro = `Welcome to your technical assessment for the role of ${interviewRole}. To start our technical conversation, please give me a brief overview of your background and walk me through a challenging engineering problem you solved recently.`;
        setMessages([
          {
            id: `ai-intro-${Date.now()}`,
            role: "ai",
            type: "INTERVIEW_QUESTION",
            content: defaultIntro,
            timestamp: new Date(),
          },
        ]);
      }
      setCurrentStage("Introduction");
    }
  };

  const handleToggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error("Exit fullscreen error:", err);
      }
    }
  };

  // Submit candidate answer in chat and receive structured response from AI
  const handleSendMessage = async (userAnswer: string) => {
    if (!userAnswer.trim() || isAiGenerating || submitting || !interviewId || isTerminatedUnprofessional) return;

    const tempCandidateMessage: ChatMessage = {
      id: `ans-${Date.now()}`,
      role: "candidate",
      type: "ANSWER",
      content: userAnswer,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, tempCandidateMessage]);
    setIsAiGenerating(true);

    try {
      const res = await interviewService.sendInterviewMessage(interviewId, userAnswer);

      if (res.unprofessionalStrikes !== undefined) {
        setUnprofessionalStrikes(res.unprofessionalStrikes);
      }

      if (res.conversationHistory && res.conversationHistory.length > 0) {
        setMessages(res.conversationHistory);
      }

      if (
        res.status === "terminated" ||
        res.turn.type === "INTERVIEW_REJECTED" ||
        res.terminationReason === "UNPROFESSIONAL_CONDUCT"
      ) {
        setIsTerminatedUnprofessional(true);
        setTerminationReason(res.terminationReason || "UNPROFESSIONAL_CONDUCT");
        setCurrentStage("Completed");

        // Immediately stop proctoring and exit fullscreen back to normal window mode
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          setIsFullscreen(false);
        }

        toast.error(
          "Interview concluded: Candidacy rejected due to repeated unprofessional conduct (3/3 warnings).",
          { autoClose: 8000 }
        );
        return;
      }

      if (res.turn.isUnprofessional) {
        toast.warn(
          `Professional Conduct Warning (${res.unprofessionalStrikes || 1}/3): Please maintain professional interview conduct.`,
          { autoClose: 5000 }
        );
      }

      if (res.turn.type === "CODING_QUESTION") {
        const codingPayload: CodingQuestion =
          res.activeCodingQuestion || {
            questionId: res.turn.questionId,
            title: res.turn.title || "Technical Coding Challenge",
            question: res.turn.question,
            language: res.turn.language || "javascript",
            timeLimitSeconds: res.turn.timeLimitSeconds || 1200,
            constraints: res.turn.constraints || [],
            examples: res.turn.examples || [],
            starterCode: res.turn.starterCode || "",
            evaluationCriteria: res.turn.evaluationCriteria || [],
          };

        setActiveCodingQuestion(codingPayload);
        setCurrentStage("Coding Round");
        toast.info("Coding challenge activated! Solve and submit your solution in the coding editor.", {
          autoClose: 5000,
        });
      } else if (res.turn.type === "INTERVIEW_COMPLETE") {
        setCurrentStage("Completed");
        toast.success("All technical interview questions answered! Click 'End' to review your report.", {
          autoClose: 6000,
        });
      } else {
        if (res.turn.isFollowUp) {
          setCurrentStage("Follow-up");
        } else {
          setCurrentStage("Core Questions");
        }
      }
    } catch (err) {
      console.error("Error communicating with AI interviewer:", err);
      toast.error(getErrorMessage(err, "Could not reach AI interviewer. Please try sending again."));
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Submit candidate code from Coding Workspace
  const handleSubmitCode = async (
    code: string,
    language: string,
  ): Promise<CodingEvaluation | null> => {
    if (!activeCodingQuestion || isSubmittingCode || !interviewId) return null;
    setIsSubmittingCode(true);

    try {
      const res = await interviewService.submitCodingSolution(interviewId, {
        code,
        language,
        questionId: activeCodingQuestion.questionId,
      });

      if (res.evaluation) {
        setCodingEvaluation(res.evaluation);
      }

      if (res.conversationHistory) {
        setMessages(res.conversationHistory);
      }

      toast.success("Code solution evaluated! Review the AI feedback rubric and discuss in chat.", {
        autoClose: 5000,
      });
      return res.evaluation ?? null;
    } catch (err) {
      console.error("Code submission error:", err);
      toast.error(getErrorMessage(err, "Could not evaluate code solution. Please try again."));
      return null;
    } finally {
      setIsSubmittingCode(false);
    }
  };

  // Finish interview modal confirm
  const handleFinishInterview = async () => {
    if (submitting || !interviewId) return;

    Modal.confirm({
      title: "Finish Technical Assessment?",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to finish the interview and generate your performance report?",
      okText: "Yes, Finish Assessment",
      cancelText: "Continue Answering",
      okButtonProps: { className: "bg-brand text-primary-foreground font-semibold" },
      onOk: async () => {
        await submitAndRedirect();
      },
    });
  };

  if (loadingQuestions) {
    return <PageSkeleton page="dashboard" />;
  }

  if (notFoundError) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8 text-foreground select-none">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ExclamationCircleOutlined className="text-2xl" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Interview Not Found
            </h1>
            <p className="text-sm text-text-secondary">
              {notFoundError || "The requested interview session could not be found or has expired."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-brand-hover transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate("/interview")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
            >
              Start New Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. CHEATER DETECTED TERMINATION SCREEN
  if (cheatingDetected || violationCount >= MAX_VIOLATIONS) {
    return (
      <CheaterDetectedScreen
        role={interviewRole}
        violations={violationLogs}
        onNavigateHome={() => navigate("/dashboard")}
      />
    );
  }

  // 2. BEGIN INTERVIEW READINESS SCREEN (Matching website theme)
  if (!interviewStarted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8 text-foreground select-none">
        <ToastContainer position="top-right" theme="dark" />
        <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-primary-foreground shadow-sm mb-2">
              <CodeOutlined className="text-2xl" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Technical Assessment Readiness
            </h1>
            <p className="text-sm text-muted-foreground">
              Candidate: <strong className="text-foreground">{interviewRole}</strong>
            </p>
          </div>

          {/* Assessment Guidelines */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3 text-xs leading-relaxed text-foreground">
            <h3 className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheckOutlined className="text-brand text-sm" />
              Proctoring &amp; Assessment Guidelines
            </h3>
            <ul className="space-y-2 list-none pl-0">
              <li className="flex items-start gap-2">
                <CheckCircleOutlined className="text-brand mt-0.5 shrink-0" />
                <span><strong>Full-Screen Mode:</strong> Clicking "Begin Interview" automatically requests full-screen. Exiting full-screen is monitored.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleOutlined className="text-brand mt-0.5 shrink-0" />
                <span><strong>Tab Switch Policy:</strong> Maximum 2 security warnings. The 1st is an alert; the 2nd terminates the assessment immediately.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleOutlined className="text-brand mt-0.5 shrink-0" />
                <span><strong>Dynamic Coding Workspace:</strong> When practical coding is assigned, the resizable code editor opens on the right.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleOutlined className="text-brand mt-0.5 shrink-0" />
                <span><strong>Input Options:</strong> You may type your responses or use speech-to-text with your microphone.</span>
              </li>
            </ul>
          </div>

          {/* Prominent Begin Button */}
          <button
            onClick={handleBeginInterview}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-hover text-primary-foreground py-3.5 text-base font-semibold shadow-md transition-all cursor-pointer"
          >
            <PlayCircleOutlined className="text-lg" />
            <span>Begin Interview</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. ACTIVE TWO-COLUMN FULLSCREEN INTERVIEW LAYOUT
  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="flex h-screen w-screen flex-col overflow-hidden bg-background font-sans text-foreground select-none"
    >
      <ToastContainer position="top-right" theme="dark" />

      {/* Top Header Bar */}
      <InterviewHeaderBar
        role={interviewRole}
        stage={currentStage}
        remainingSeconds={remainingSeconds}
        violationCount={violationCount}
        maxViolations={MAX_VIOLATIONS}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onFinishInterview={handleFinishInterview}
        isSubmitting={submitting}
      />

      {/* Main Two-Column Resizable Workspace */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Column 1: AI Interview Chat */}
        <section
          style={{
            width: isCodeFullWidth
              ? "0%"
              : activeCodingQuestion
              ? `${chatWidthPercent}%`
              : "100%",
          }}
          className={`flex flex-col overflow-hidden transition-[width] duration-75 ${
            isCodeFullWidth ? "hidden" : "flex"
          } ${!activeCodingQuestion ? "max-w-4xl mx-auto" : ""}`}
        >
          <InterviewChat
            messages={messages}
            isAiGenerating={isAiGenerating}
            onSendMessage={handleSendMessage}
            hasActiveCodingQuestion={Boolean(activeCodingQuestion)}
            onOpenCodingWorkspace={() => setIsCodeFullWidth(true)}
            isTerminated={isTerminatedUnprofessional}
            terminationReason={terminationReason}
            unprofessionalStrikes={unprofessionalStrikes}
            onEndAssessment={handleFinishInterview}
          />
        </section>

        {/* Draggable Divider Bar (visible when coding question is active and not full-width) */}
        {activeCodingQuestion && !isCodeFullWidth && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingDivider(true);
            }}
            className={`w-1.5 hover:w-2 bg-border hover:bg-brand cursor-col-resize select-none transition-all flex items-center justify-center group z-20 ${
              isDraggingDivider ? "w-2 bg-brand" : ""
            }`}
            title="Drag to resize chat and coding workspace"
          >
            <div className="h-8 w-1 rounded-full bg-border-strong group-hover:bg-primary-foreground" />
          </div>
        )}

        {/* Column 2: Dynamic Coding Workspace */}
        <section
          style={{
            width: isCodeFullWidth
              ? "100%"
              : activeCodingQuestion
              ? `${100 - chatWidthPercent}%`
              : "0%",
          }}
          className={`flex flex-col overflow-hidden transition-[width] duration-75 ${
            activeCodingQuestion || isCodeFullWidth ? "flex" : "hidden"
          }`}
        >
          <CodingWorkspace
            key={activeCodingQuestion?.questionId ?? "inactive"}
            codingQuestion={activeCodingQuestion}
            onSubmitCode={handleSubmitCode}
            isSubmitting={isSubmittingCode}
            evaluationResult={codingEvaluation}
            isFullWidth={isCodeFullWidth}
            isTerminated={isTerminatedUnprofessional}
            onToggleFullWidth={() => setIsCodeFullWidth((prev) => !prev)}
          />
        </section>
      </main>

      {/* Proctoring Warning Modal (1st violation) */}
      <ViolationWarningModal
        open={warningModalOpen}
        violationType={currentViolationType}
        violationCount={violationCount}
        maxViolations={MAX_VIOLATIONS}
        onAcknowledge={async () => {
          setWarningModalOpen(false);
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen().catch(() => {});
          }
        }}
      />
    </div>
  );
}
