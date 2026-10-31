import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  Download,
  FileQuestion,
  LayoutDashboard,
  Loader2,
  ShieldAlert,
  Sparkles,
  User,
} from "lucide-react";
import ProgressHeader from "@/components/session/ProgressHeader";
import QuestionCard from "@/components/session/QuestionCard";
import AnswerBox from "@/components/session/AnswerBox";
import CameraMonitor from "@/components/session/CameraMonitor";
import CameraPermissionCheck from "@/components/session/CameraPermissionCheck";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { getErrorMessage } from "@/lib/apiError";
import ScoreCard from "@/components/report/ScoreCard";
import StrengthWeakness from "@/components/report/StrengthWeakness";
import LearningPath from "@/components/report/LearningPath";
import TipsSection from "@/components/report/TipsSection";
import QuestionAnalysis from "@/components/report/QuestionAnalysis";
import type { InterviewReport } from "@/types/api";
import {
  interviewService,
  type SharedAttempt,
  type SharedInterviewPublic,
  type SharedQuestion,
} from "@/services/interviewServices";

const formatTime = (milliseconds: number) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
};

export default function SharedInterviewJoin() {
  const navigate = useNavigate();
  const { token = "" } = useParams();
  const interviewContainerRef = useRef<HTMLDivElement>(null);

  const [details, setDetails] = useState<SharedInterviewPublic | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [attempt, setAttempt] = useState<SharedAttempt | null>(null);
  const [questions, setQuestions] = useState<SharedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [error, setError] = useState("");

  // Proctoring states
  const [cameraReady, setCameraReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenExited, setFullscreenExited] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [autoSubmittedReason, setAutoSubmittedReason] = useState<string | null>(null);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState("");

  const submissionLock = useRef(false);
  const attemptRef = useRef(attempt);
  const questionsRef = useRef(questions);
  const answersRef = useRef(answers);

  useEffect(() => {
    try {
      const storedName = sessionStorage.getItem("name");
      if (storedName) {
        const parsed = JSON.parse(storedName);
        if (parsed && typeof parsed === "string") {
          setCandidateName((current) => current || parsed);
        }
      }
      const storedEmail = sessionStorage.getItem("email");
      if (storedEmail) {
        const parsedEmail = JSON.parse(storedEmail);
        if (parsedEmail && typeof parsedEmail === "string") {
          setLoggedInUserEmail(parsedEmail);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    attemptRef.current = attempt;
    questionsRef.current = questions;
    answersRef.current = answers;
  }, [attempt, questions, answers]);

  useEffect(() => {
    interviewService
      .getSharedInterview(token)
      .then(setDetails)
      .catch((reason) =>
        setError(
          getErrorMessage(reason, "This interview link is not available."),
        ),
      )
      .finally(() => setLoading(false));
  }, [token]);

  const enterFullscreen = useCallback(async () => {
    const el = interviewContainerRef.current || document.documentElement;
    if (el.requestFullscreen) {
      try {
        await el.requestFullscreen();
        setIsFullscreen(true);
        setFullscreenExited(false);
      } catch (err) {
        console.warn("Could not enter fullscreen mode:", err);
      }
    }
  }, []);

  const submitInterview = useCallback(async (automatic = false) => {
    const activeAttempt = attemptRef.current;
    const activeQuestions = questionsRef.current;
    const activeAnswers = answersRef.current;
    if (!activeAttempt || submissionLock.current) return;
    submissionLock.current = true;
    setSubmitting(true);
    setError("");

    try {
      const generatedReport = await interviewService.submitSharedInterview(
        activeAttempt.attemptId,
        activeQuestions.map((question) => ({
          questionId: question._id,
          answer: activeAnswers[question._id]?.trim() || "",
        })),
      );
      setReport(generatedReport as InterviewReport);
      setSubmitted(true);
    } catch (reason) {
      if (automatic)
        setError(
          getErrorMessage(
            reason,
            "Your interview ended, but the final submission failed.",
          ),
        );
      else
        toast.error(getErrorMessage(reason, "Could not submit the interview."));
      submissionLock.current = false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Exit fullscreen when submitted so user can comfortably view and save report
  useEffect(() => {
    if (submitted && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [submitted]);

  // Timer handling
  useEffect(() => {
    if (!attempt || submitted) return;
    const updateTimer = () => {
      const remaining = new Date(attempt.expiresAt).getTime() - Date.now();
      setTimeLeft(remaining);
      if (remaining <= 0) void submitInterview(true);
    };
    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(interval);
  }, [attempt, submitted, submitInterview]);

  useEffect(() => {
    if (!attempt || submitted) return;

    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isFull);
      if (!isFull) {
        setFullscreenExited(true);
      } else {
        setFullscreenExited(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [attempt, submitted]);

  useEffect(() => {
    if (!attempt || submitted || questions.length === 0) return;

    let armed = false;
    const timer = setTimeout(() => {
      armed = true;
    }, 1200);

    let lastSwitchTime = 0;

    const handleTabSwitch = () => {
      if (!armed || submissionLock.current) return;
      const now = Date.now();
      if (now - lastSwitchTime < 1500) return;
      lastSwitchTime = now;

      setTabSwitchCount((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          setAutoSubmittedReason(
            "Exceeded maximum allowed tab switches (3/3). Test submitted automatically.",
          );
          toast.error(
            "Tab switch limit reached (3/3)! Submitting interview automatically...",
            { autoClose: 5000 },
          );
          void submitInterview(true);
          return 3;
        } else {
          toast.warn(
            `Tab switch detected (${next}/3)! Switching tabs 3 times will automatically submit your interview.`,
            { autoClose: 4000 },
          );
          return next;
        }
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabSwitch();
      }
    };

    const handleWindowBlur = () => {
      handleTabSwitch();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [attempt, submitted, questions.length, submitInterview]);

  useEffect(() => {
    if (!attempt || submitted) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [attempt, submitted]);

  const startInterview = async () => {
    if (!cameraReady) {
      toast.error("Camera permission is required before starting the interview.");
      return;
    }
    if (candidateName.trim().length < 2) {
      toast.error("Enter your name before starting.");
      return;
    }
    setStarting(true);
    try {
      await enterFullscreen();
      const joined = await interviewService.joinSharedInterview(
        token,
        candidateName.trim(),
      );
      const loadedQuestions = await interviewService.getSharedQuestions(joined.attemptId);
      setAttempt(joined);
      setQuestions(loadedQuestions);
    } catch (reason) {
      toast.error(getErrorMessage(reason, "Could not start this interview."));
    } finally {
      setStarting(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const goNext = async () => {
    if (!attempt || !currentQuestion || submitting) return;
    setSubmitting(true);
    try {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((index) => index + 1);
      } else {
        await submitInterview(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const requestFollowUp = async () => {
    if (!attempt || !currentQuestion) return;
    const answer = answers[currentQuestion._id]?.trim();
    if (!answer) return;
    setSubmitting(true);
    try {
      const response = await interviewService.getSharedFollowUp(
        attempt.attemptId,
        currentQuestion._id,
        answer,
      );
      if (!response.followUp) {
        toast.info("No additional follow-up is needed for this answer.");
        return;
      }
      setQuestions((existing) => {
        const next = existing.map((question) =>
          question.order > currentQuestion.order
            ? { ...question, order: question.order + 1 }
            : question,
        );
        next.splice(currentIndex + 1, 0, response.followUp as SharedQuestion);
        return next;
      });
      setCurrentIndex((index) => index + 1);
    } catch (reason) {
      toast.error(getErrorMessage(reason, "Could not prepare a follow-up."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveReport = () => {
    window.print();
  };

  if (loading)
    return (
      <main className="grid min-h-screen place-items-center bg-background text-foreground">
        Loading interview...
      </main>
    );

  if (error && !attempt)
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground">
        <div>
          <h1 className="text-2xl font-semibold">Interview unavailable</h1>
          <p className="mt-3 text-100">{error}</p>
        </div>
      </main>
    );

 if (submitted)
    return (
      <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
        <ToastContainer position="top-right" autoClose={3500} />

       <header className="shrink-0 border-b border-border bg-surface px-4 sm:px-6 py-4 shadow-sm print:hidden">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Interview Complete
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Interview Performance Report
              </h1>
              <p className="text-xs sm:text-sm text-100">
                Candidate: <strong className="text-foreground">{attempt?.candidateName || "Candidate"}</strong>
                {details?.title ? ` · ${details.title}` : attempt?.title ? ` · ${attempt.title}` : ""}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleSaveReport}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs sm:text-sm font-medium text-foreground hover:bg-surface-hover shadow-sm transition-colors cursor-pointer"
                title="Save or print report as PDF"
              >
                <Download className="h-4 w-4 text-brand" />
                <span>Save Report</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs sm:text-sm font-medium text-primary-foreground hover:bg-brand-hover shadow-sm transition-colors cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Go to Dashboard</span>
              </button>

              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 print:overflow-visible print:h-auto">
          <div className="mx-auto max-w-5xl space-y-6 pb-12">
            {autoSubmittedReason && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <span>{autoSubmittedReason}</span>
              </div>
            )}

            {report ? (
              <>
                <ScoreCard report={report} />
                <StrengthWeakness report={report} />
                <LearningPath report={report} />
                <TipsSection report={report} />
                <QuestionAnalysis report={report} />
              </>
            ) : (
              <div className="grid min-h-[300px] place-items-center text-center text-100">
                <p>Preparing your report...</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );

  if (!attempt) {
    const isNameValid = candidateName.trim().length >= 2;
    const canStart = !starting && cameraReady && isNameValid;

    return (
      <div className="min-h-screen bg-background text-foreground">
        <ToastContainer position="top-right" autoClose={3500} />

        <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand text-primary-foreground flex items-center justify-center font-bold shadow-sm">
                <i className="fa-solid fa-brain"></i>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight">InterviewAI</span>
                <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full border border-border bg-surface-hover text-100 font-medium">
                  Assessment Portal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
         <div className="mb-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                <Sparkles className="w-3.5 h-3.5" />
                Assessment Invitation
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium border border-border bg-surface text-100">
                {details?.interviewType || "Technical Interview"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {details?.title || "Online Technical Assessment"}
            </h1>

            <p className="text-100 text-base max-w-3xl leading-relaxed">
              Welcome to your automated interview assessment. Review the target role details, total duration, test instructions, and proctoring disclaimer below. Complete the check-in and webcam verification to begin.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
              <div className="flex items-center gap-2 text-100 mb-1">
                <Briefcase className="w-4 h-4 text-brand" />
                <span className="text-xs font-medium uppercase tracking-wider">Interview Role</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-foreground truncate" title={details?.role}>
                {details?.role || "Software Engineer"}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
              <div className="flex items-center gap-2 text-100 mb-1">
                <FileQuestion className="w-4 h-4 text-brand" />
                <span className="text-xs font-medium uppercase tracking-wider">Total Questions</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-foreground">
                {details?.questionCount || 0} Questions
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
              <div className="flex items-center gap-2 text-100 mb-1">
                <Clock className="w-4 h-4 text-brand" />
                <span className="text-xs font-medium uppercase tracking-wider">Total Time</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-foreground">
                {details?.durationMinutes || 0} Minutes
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
              <div className="flex items-center gap-2 text-100 mb-1">
                <Code2 className="w-4 h-4 text-brand" />
                <span className="text-xs font-medium uppercase tracking-wider">Skill Areas</span>
              </div>
              <p className="font-bold text-sm sm:text-base text-foreground">
                {details?.technologies?.length || 0} Technologies
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              {details?.technologies && details.technologies.length > 0 && (
                <section className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-brand" />
                    <h2 className="text-lg font-semibold">Technologies & Skill Focus</h2>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {details.technologies.map((tech) => (
                      <div
                        key={tech.name}
                        className="rounded-xl border border-border bg-background/60 p-3 text-sm space-y-1"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <strong className="font-semibold text-foreground">{tech.name}</strong>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-hover font-medium text-100">
                            {tech.level}
                          </span>
                        </div>
                        {tech.topics.length > 0 && (
                          <p className="text-xs text-100 leading-relaxed">
                            Focus: {tech.topics.join(", ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand" />
                  <h2 className="text-lg font-semibold">Interview Instructions</h2>
                </div>

                <div className="grid gap-3.5 text-sm">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-border/60">
                    <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Fullscreen Environment</p>
                      <p className="text-xs text-100 mt-0.5">
                        The test opens in full screen to minimize distractions. Exiting fullscreen automatically pauses your interview.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-border/60">
                    <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Continuous Webcam Proctoring</p>
                      <p className="text-xs text-100 mt-0.5">
                        Your webcam feed is monitored via real-time face tracking. Make sure you are in a well-lit room and stay facing the camera.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-border/60">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Strict Tab Switching Limit (Max 3)</p>
                      <p className="text-xs text-100 mt-0.5">
                        Navigating away from the interview tab or minimizing the browser window is restricted. Reaching <strong>3 tab switches</strong> will automatically submit your assessment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-border/60">
                    <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Real-time Countdown & AI Follow-ups</p>
                      <p className="text-xs text-100 mt-0.5">
                        The timer begins as soon as you start. Provide detailed, well-structured responses. The AI may present adaptive follow-up questions.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <h3 className="font-semibold text-sm">Assessment Disclaimer & Integrity Agreement</h3>
                </div>
                <p className="text-xs text-100 leading-relaxed">
                  By starting this interview, you certify that you are the registered candidate taking this evaluation independently without unauthorized external assistance, 100 devices, or third-party generative AI tools. Proctoring events, including webcam tracking and tab switches, are recorded and appended to your final report for review.
                </p>
              </section>
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
              <section className="p-6 rounded-2xl border border-border bg-surface shadow-xl space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                      Step 1 of 2
                    </span>
                    <span className="text-xs text-100">Required Check-in</span>
                  </div>
                  <h2 className="text-xl font-bold mt-1">Candidate Check-in</h2>
                  <p className="text-xs text-100 mt-0.5">
                    Enter your name and test your camera to unlock the interview.
                  </p>
                </div>

                {loggedInUserEmail && (
                  <div className="flex items-center justify-between text-xs bg-surface-hover/60 px-3 py-2 rounded-xl border border-border">
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      <span>Authenticated Account</span>
                    </div>
                    <span className="text-secondary font-mono text-[11px] truncate max-w-[180px]">
                      {loggedInUserEmail}
                    </span>
                  </div>
                )}

                <label className="block space-y-2">
                  <span className="text-sm font-medium flex items-center justify-between">
                    <span>Full Name</span>
                    {candidateName.trim().length >= 2 ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                      </span>
                    ) : (
                      <span className="text-xs text-100">Min. 2 characters</span>
                    )}
                  </span>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-100">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      value={candidateName}
                      onChange={(event) => setCandidateName(event.target.value)}
                      className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition"
                      placeholder="Enter your full name"
                    />
                  </div>
                </label>

                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand mb-2 block">
                    Step 2 of 2: Camera Verification
                  </span>
                  <CameraPermissionCheck
                    onReadyChange={setCameraReady}
                    title="Camera Verification"
                    description="Webcam access is required for proctoring. Verify your feed below."
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-border text-xs">
                  <p className="font-medium text-foreground">Pre-flight Checklist:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        isNameValid ? "bg-emerald-500 text-white" : "border border-border text-100"
                      }`}>
                        {isNameValid ? "✓" : "○"}
                      </span>
                      <span className={isNameValid ? "text-foreground font-medium" : "text-100"}>
                        Candidate name provided
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        cameraReady ? "bg-emerald-500 text-white" : "border border-border text-100"
                      }`}>
                        {cameraReady ? "✓" : "○"}
                      </span>
                      <span className={cameraReady ? "text-foreground font-medium" : "text-100"}>
                        Camera permission granted
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                      <span className="text-foreground font-medium">
                        Fullscreen mode supported
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canStart}
                  onClick={() => void startInterview()}
                  className="w-full rounded-xl bg-brand py-3.5 px-5 font-semibold text-sm text-primary-foreground shadow-md hover:bg-brand-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {starting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating questions...</span>
                    </>
                  ) : !isNameValid ? (
                    <span>Enter your name to continue</span>
                  ) : !cameraReady ? (
                    <span>Allow camera access to begin</span>
                  ) : (
                    <>
                      <span>Start Interview (Fullscreen)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-100">
                  Clicking start will open fullscreen mode and begin your countdown timer.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!currentQuestion)
    return (
      <main className="grid min-h-screen place-items-center bg-background text-foreground">
        Preparing question {questions.length}...
      </main>
    );

  return (
    <div
      ref={interviewContainerRef}
      className="min-h-screen bg-background px-4 sm:px-6 py-8 text-foreground"
      onContextMenu={(e) => e.preventDefault()}
    >
      <ToastContainer position="top-right" autoClose={3500} />

      <CameraMonitor tabSwitchCount={tabSwitchCount} maxTabSwitches={3} />

      <main className="mx-auto max-w-4xl space-y-6">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
          <div>
            <p className="text-sm text-100">{attempt.title}</p>
            <p className="font-medium">{attempt.candidateName}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  tabSwitchCount === 0
                    ? "bg-emerald-500"
                    : tabSwitchCount === 1
                    ? "bg-amber-500"
                    : "bg-red-500 animate-pulse"
                }`}
              />
              <span className="font-medium">
                Tab Switches:{" "}
                <strong
                  className={
                    tabSwitchCount === 0
                      ? "text-emerald-500"
                      : tabSwitchCount === 1
                      ? "text-amber-500"
                      : "text-red-500 font-bold"
                  }
                >
                  {tabSwitchCount} / 3
                </strong>
              </span>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-100">
                Time remaining
              </p>
              <p
                className={`text-2xl font-bold tabular-nums ${
                  timeLeft < 5 * 60_000 ? "text-error" : "text-brand"
                }`}
              >
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        </div>

        {tabSwitchCount > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs sm:text-sm text-amber-600 dark:text-amber-400">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                <strong>Warning:</strong> Tab switch detected ({tabSwitchCount}/3). You have{" "}
                {3 - tabSwitchCount} switch{3 - tabSwitchCount === 1 ? "" : "es"} remaining before automatic submission.
              </span>
            </div>
          </div>
        )}

        <ProgressHeader
          current={currentIndex + 1}
          total={questions.length}
          answered={
            Object.values(answers).filter((answer) => answer.trim()).length
          }
          timeLeft={formatTime(timeLeft)}
        />

        <QuestionCard
          category={
            currentIndex === 0
              ? "Introduction"
              : currentQuestion.followUpToQuestionId
                ? "Follow-up"
                : "Interview question"
          }
          difficulty="Configured per technology"
          question={currentQuestion.questionText}
        />

        <AnswerBox
          key={currentQuestion._id}
          value={answers[currentQuestion._id] || ""}
          onChange={(value) =>
            setAnswers((existing) => ({
              ...existing,
              [currentQuestion._id]: value,
            }))
          }
        />

        <div className="flex flex-wrap justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            disabled={currentIndex === 0}
            className="rounded-lg border border-border px-5 py-2 disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          {currentIndex > 0 && currentQuestion.order !== 1 && (
            <button
              type="button"
              onClick={() => void requestFollowUp()}
              disabled={submitting || !answers[currentQuestion._id]?.trim()}
              className="rounded-lg border border-border px-5 py-2 disabled:opacity-40 cursor-pointer"
            >
              Request clarification
            </button>
          )}
          <button
            type="button"
            onClick={() => void goNext()}
            disabled={submitting}
            className="rounded-lg bg-brand px-5 py-2 font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer"
          >
            {submitting
              ? "Please wait..."
              : currentIndex === questions.length - 1
                ? "Submit interview"
                : "Next question"}
          </button>
        </div>

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </main>

      {fullscreenExited && !isFullscreen && !submitted && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-background/95 backdrop-blur-sm px-6">
          <section
            className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-surface p-8 text-center shadow-2xl"
            aria-labelledby="fullscreen-pause-title"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h2 id="fullscreen-pause-title" className="text-xl font-semibold">
              Interview Paused
            </h2>
            <p className="text-sm text-100">
              Fullscreen mode is required for interview proctoring. The interview is paused until you resume fullscreen.
            </p>
            <button
              type="button"
              onClick={() => void enterFullscreen()}
              className="w-full rounded-md bg-brand px-5 py-2.5 font-medium text-primary-foreground hover:bg-brand-hover cursor-pointer"
            >
              Resume fullscreen
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
