import { useEffect, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ProgressHeader from "@/components/session/ProgressHeader";
import QuestionCard from "@/components/session/QuestionCard";
import AnswerBox from "@/components/session/AnswerBox";
import NavigationControls from "@/components/session/NavigationControls";
import CameraMonitor from "@/components/session/CameraMonitor";

import { interviewService } from "@/services/interviewServices";
import { answerDraftSchema } from "@/lib/validation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import PageSkeleton from "@/components/ui/PageSkeleton";
import { getErrorMessage } from "@/lib/apiError";

type Question = {
  _id: string;
  questionText: string;
  order: number;
  followUpToQuestionId?: string;
  isTechnologyClarification?: boolean;
};

const draftKey = (interviewId?: string) => `interview-draft-${interviewId}`;

const loadDraft = (interviewId?: string): Record<string, string> => {
  try {
    const savedDraft = localStorage.getItem(draftKey(interviewId));
    if (!savedDraft) return {};

    const validation = answerDraftSchema.safeParse(JSON.parse(savedDraft));
    if (validation.success) return validation.data;

    console.error("Ignoring invalid saved interview answers", validation.error);
    localStorage.removeItem(draftKey(interviewId));
    return {};
  } catch (error) {
    console.error("Could not read saved interview answers", error);
    return {};
  }
};

const preventClipboardAction = (event: ClipboardEvent<HTMLDivElement>) => {
  event.preventDefault();
};

const preventClipboardShortcuts = (event: KeyboardEvent<HTMLDivElement>) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    ["c", "v", "x"].includes(event.key.toLowerCase())
  ) {
    event.preventDefault();
  }
};

export default function SessionPage() {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const interviewContainerRef = useRef<HTMLDivElement>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    loadDraft(interviewId),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenExited, setFullscreenExited] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = questions.filter((q) => answers[q._id]?.trim()).length;

  useEffect(() => {
    if (!interviewId) {
      console.error("Interview ID missing");
      return;
    }

    const fetchQuestions = async () => {
      try {
        const data = await interviewService.getQuestions(interviewId);
        setQuestions(data);
      } catch (err) {
        console.error("Failed to load questions", err);
        setError("Could not load the questions. Please refresh the page.");
      }
    };

    fetchQuestions();
  }, [interviewId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen =
        document.fullscreenElement === interviewContainerRef.current;
      setIsFullscreen(fullscreen);
      if (fullscreen) {
        setFullscreenExited(false);
        setFullscreenError(null);
      } else if (interviewStarted) {
        setFullscreenExited(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [interviewStarted]);

  useEffect(() => {
    if (!interviewStarted || submitted) return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [interviewStarted, submitted]);

  const enterFullscreen = async () => {
    const container = interviewContainerRef.current;
    if (!container?.requestFullscreen) {
      setFullscreenError("Fullscreen is not supported by this browser.");
      return;
    }

    try {
      await container.requestFullscreen();
      setIsFullscreen(document.fullscreenElement === container);
      setFullscreenExited(false);
      setInterviewStarted(true);
      setFullscreenError(null);
    } catch (requestError) {
      console.error("Could not enter interview fullscreen", requestError);
      setFullscreenError(
        "Could not enter fullscreen. Allow fullscreen in your browser, or continue without it.",
      );
    }
  };

  const continueWithoutFullscreen = () => {
    setIsFullscreen(false);
    setInterviewStarted(true);
    setFullscreenExited(false);
    setFullscreenError(null);
  };

  // keep the draft in localStorage
  useEffect(() => {
    if (!interviewId) return;
    localStorage.setItem(draftKey(interviewId), JSON.stringify(answers));
  }, [answers, interviewId]);

  const handleAnswerChange = (val: string) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: val,
    }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinishEarly = () => {
    if (!currentQuestion || submitting) return;

    setUnansweredCount(
      questions.filter((question) => !answers[question._id]?.trim()).length,
    );
    setShowFinishConfirm(true);
    setError(null);
  };

  const handleFinish = async (confirmed = false) => {
    if (!interviewId || !currentQuestion || submitting) return;

    const unanswered = questions.filter(
      (question) => !answers[question._id]?.trim(),
    ).length;

    // Final-question submission still requires confirmation when answers are missing.
    if (unanswered > 0 && !confirmed) {
      setUnansweredCount(unanswered);
      setShowFinishConfirm(true);
      setError(null);
      return;
    }

    // Keep existing validation after confirmation.
    if (
      questions.some(
        (question) =>
          question.isTechnologyClarification && !answers[question._id]?.trim(),
      )
    ) {
      setShowFinishConfirm(false);
      setError(
        "List the technologies you work with before finishing the interview.",
      );
      return;
    }

    const introduction = questions.find((question) => question.order === 1);

    if (!answers[introduction?._id ?? ""]?.trim()) {
      setShowFinishConfirm(false);
      setError("A brief introduction is required before you finish.");
      return;
    }

    setShowFinishConfirm(false);
    setSubmitting(true);
    setError(null);

    try {
      await interviewService.submitInterview(
        interviewId,
        questions.map((question) => ({
          questionId: question._id,
          answer: (answers[question._id] ?? "").trim(),
        })),
      );

      setSubmitted(true);
      localStorage.removeItem(draftKey(interviewId));
      navigate(`/report/${interviewId}`);
    } catch (err: unknown) {
      console.error("Could not finish interview", err);

      setError(
        getErrorMessage(
          err,
          "Could not finish the interview. Your answers are saved; please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!interviewId || !currentQuestion || submitting) return;
    if (
      currentIndex === questions.length - 1 &&
      !currentQuestion.isTechnologyClarification
    ) {
      await handleFinish();
      return;
    }
    const answer = (answers[currentQuestion._id] ?? "").trim();
    if (currentQuestion.order === 1 && !answer) {
      setError("A brief introduction is required before you continue.");
      return;
    }
    if (currentQuestion.isTechnologyClarification && !answer) {
      setError("List the technologies you work with before continuing.");
      return;
    }
    if (currentQuestion.isTechnologyClarification && answer.length > 500) {
      setError("Your technology list cannot exceed 500 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (currentQuestion.isTechnologyClarification) {
        const scopedQuestions = await interviewService.resolveTechnologies(
          interviewId,
          currentQuestion._id,
          answer,
        );
        setQuestions(scopedQuestions);
        setAnswers((previous) => {
          const next = { ...previous };
          delete next[currentQuestion._id];
          return next;
        });
        setCurrentIndex(1);
        return;
      }

      if (
        answer.length >= 30 &&
        currentQuestion.order !== 1 &&
        !currentQuestion.followUpToQuestionId
      ) {
        const result = await interviewService.getAnswerFollowUp(
          interviewId,
          currentQuestion._id,
          answer,
        );
        if (result.followUp) {
          const nextQuestions = questions.some(
            (question) => question._id === result.followUp?._id,
          )
            ? questions
            : [
                ...questions.slice(0, currentIndex + 1),
                result.followUp,
                ...questions.slice(currentIndex + 1),
              ];
          setQuestions(nextQuestions);
          const followUpIndex = nextQuestions.findIndex(
            (question) => question._id === result.followUp?._id,
          );
          setCurrentIndex(followUpIndex);
          return;
        }
      }

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((index) => index + 1);
      }
    } catch (err: unknown) {
      console.error("Could not continue interview", err);
      setError(
        getErrorMessage(
          err,
          "Could not continue the interview. Your answer is saved; please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!questions.length) {
    if (error) {
      return (
        <div
          className="grid min-h-screen place-items-center bg-background px-6 text-center text-error"
          role="alert"
        >
          {error}
        </div>
      );
    }
    return <PageSkeleton page="session" />;
  }

  return (
    <div
      ref={interviewContainerRef}
      className="min-h-screen w-full overflow-x-hidden bg-background px-4 py-6 text-foreground sm:px-6 sm:py-10"
      onCopy={preventClipboardAction}
      onCut={preventClipboardAction}
      onPaste={preventClipboardAction}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={preventClipboardShortcuts}
    >
      <div className="mx-auto w-full max-w-4xl min-w-0 space-y-6">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        {interviewStarted && !submitted && <CameraMonitor />}

        <ProgressHeader
          current={currentIndex + 1}
          total={questions.length}
          answered={answeredCount}
          timeLeft=""
        />

        <QuestionCard
          category={
            currentQuestion.followUpToQuestionId
              ? "Follow-up"
              : currentQuestion.order === 1
                ? "Introduction"
                : currentQuestion.isTechnologyClarification
                  ? "Technology selection"
                  : "Interview question"
          }
          difficulty="Based on your level"
          question={currentQuestion.questionText}
        />

        <AnswerBox
          key={currentQuestion._id}
          value={answers[currentQuestion._id] || ""}
          onChange={handleAnswerChange}
        />

        {currentQuestion.order === 1 && (
          <p className="text-sm text-secondary">
            A brief introduction is required to continue.
          </p>
        )}
        {currentQuestion.isTechnologyClarification && (
          <p className="text-sm text-secondary">
            List the technologies you work with, separated by commas. The
            remaining questions will focus only on those technologies (up to 500
            characters).
          </p>
        )}
        {error && <p className="text-sm text-error">{error}</p>}
        {submitting && (
          <p className="text-sm text-gray-400">
            Preparing your next question or report...
          </p>
        )}

        <NavigationControls
          onPrev={handlePrev}
          onNext={handleNext}
          onFinish={handleFinishEarly}
          isLast={isLastQuestion}
          disablePrev={currentIndex === 0}
          submitting={submitting}
        />
      </div>
      {(!interviewStarted || (fullscreenExited && !isFullscreen)) && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-background px-6">
          <section
            className="w-full max-w-lg space-y-5 rounded-2xl border border-border bg-surface p-8 text-center shadow-xl"
            aria-labelledby="fullscreen-title"
          >
            <h1 id="fullscreen-title" className="text-2xl font-semibold">
              {interviewStarted
                ? "Return to your interview"
                : "Ready to begin?"}
            </h1>
            <p className="text-secondary">
              {interviewStarted
                ? "The interview is paused while fullscreen is off. Re-enter fullscreen to continue."
                : "Your interview will open in fullscreen. Your answers are saved as you go."}
            </p>
            {fullscreenError && (
              <p className="text-sm text-error" role="alert">
                {fullscreenError}
              </p>
            )}
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={enterFullscreen}
                className="rounded-md bg-brand px-5 py-2.5 font-medium text-primary-foreground hover:bg-brand-hover"
              >
                {interviewStarted ? "Resume fullscreen" : "Begin in fullscreen"}
              </button>
              {!interviewStarted && fullscreenError && (
                <button
                  type="button"
                  onClick={continueWithoutFullscreen}
                  className="rounded-md border border-border px-5 py-2.5 font-medium hover:bg-surface-hover"
                >
                  Continue without fullscreen
                </button>
              )}
            </div>
            {interviewStarted && (
              <p className="text-xs text-secondary">
                You can leave fullscreen with your browser controls. The
                interview will remain paused until you resume it.
              </p>
            )}
          </section>
        </div>
      )}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="finish-confirm-title"
            aria-describedby="finish-confirm-description"
            className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <span className="text-xl" aria-hidden="true">
                  !
                </span>
              </div>

              <div className="space-y-2">
                <h2 id="finish-confirm-title" className="text-xl font-semibold">
                  Finish interview?
                </h2>

                <p
                  id="finish-confirm-description"
                  className="text-sm leading-6 text-100"
                >
                  {unansweredCount > 0
                    ? `${unansweredCount} ${
                        unansweredCount === 1 ? "question is" : "questions are"
                      } unanswered and will score 0. If you finish now, your interview report will be generated.`
                    : "You have answered every question. If you finish now, your interview report will be generated."}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="rounded-lg border border-border px-4 py-2.5 font-medium hover:bg-surface-hover"
              >
                Continue interview
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  void handleFinish(true);
                }}
                className="rounded-lg bg-brand px-4 py-2.5 font-medium text-primary-foreground hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Generating report..." : "Finish interview"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
