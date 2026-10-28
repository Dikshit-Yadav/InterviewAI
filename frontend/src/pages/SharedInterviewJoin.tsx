import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ProgressHeader from "@/components/session/ProgressHeader";
import QuestionCard from "@/components/session/QuestionCard";
import AnswerBox from "@/components/session/AnswerBox";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { getErrorMessage } from "@/lib/apiError";
import { interviewService, type SharedAttempt, type SharedInterviewPublic, type SharedQuestion } from "@/services/interviewServices";

const formatTime = (milliseconds: number) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}` : `${minutes}:${String(remainder).padStart(2, "0")}`;
};

export default function SharedInterviewJoin() {
  const { token = "" } = useParams();
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
  const [error, setError] = useState("");
  const submissionLock = useRef(false);
  const attemptRef = useRef(attempt);
  const questionsRef = useRef(questions);
  const answersRef = useRef(answers);

  useEffect(() => {
    attemptRef.current = attempt;
    questionsRef.current = questions;
    answersRef.current = answers;
  }, [attempt, questions, answers]);

  useEffect(() => {
    interviewService.getSharedInterview(token)
      .then(setDetails)
      .catch((reason) => setError(getErrorMessage(reason, "This interview link is not available.")))
      .finally(() => setLoading(false));
  }, [token]);

  const submitInterview = useCallback(async (automatic = false) => {
    const activeAttempt = attemptRef.current;
    const activeQuestions = questionsRef.current;
    const activeAnswers = answersRef.current;
    if (!activeAttempt || submissionLock.current) return;
    submissionLock.current = true;
    setSubmitting(true);
    setError("");
    try {
      await interviewService.submitSharedInterview(activeAttempt.attemptId, activeQuestions.map((question) => ({
        questionId: question._id,
        answer: activeAnswers[question._id]?.trim() || "",
      })));
      setSubmitted(true);
    } catch (reason) {
      if (automatic) setError(getErrorMessage(reason, "Your interview ended, but the final submission failed."));
      else toast.error(getErrorMessage(reason, "Could not submit the interview."));
      submissionLock.current = false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  useEffect(() => {
    if (!attempt) return;
    const updateTimer = () => {
      const remaining = new Date(attempt.expiresAt).getTime() - Date.now();
      setTimeLeft(remaining);
      if (remaining <= 0) void submitInterview(true);
    };
    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(interval);
  }, [attempt, submitInterview]);

  const startInterview = async () => {
    if (candidateName.trim().length < 2) {
      toast.error("Enter your name before starting.");
      return;
    }
    setStarting(true);
    try {
      const joined = await interviewService.joinSharedInterview(token, candidateName.trim());
      setAttempt(joined);
      setQuestions(await interviewService.getSharedQuestions(joined.attemptId));
    } catch (reason) {
      toast.error(getErrorMessage(reason, "Could not start this interview."));
    } finally {
      setStarting(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const goNext = async () => {
    if (!attempt || !currentQuestion || submitting) return;
    if (!answers[currentQuestion._id]?.trim()) {
      toast.error("Answer the current question before continuing.");
      return;
    }
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
      const response = await interviewService.getSharedFollowUp(attempt.attemptId, currentQuestion._id, answer);
      if (!response.followUp) {
        toast.info("No additional follow-up is needed for this answer.");
        return;
      }
      setQuestions((existing) => {
        const next = existing.map((question) => question.order > currentQuestion.order ? { ...question, order: question.order + 1 } : question);
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

  if (loading) return <main className="grid min-h-screen place-items-center bg-background text-foreground">Loading interview...</main>;
  if (error && !attempt) return <main className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground"><div><h1 className="text-2xl font-semibold">Interview unavailable</h1><p className="mt-3 text-secondary">{error}</p></div></main>;
  if (submitted) return <main className="grid min-h-screen place-items-center bg-background px-6 text-center text-foreground"><section className="max-w-lg space-y-4"><h1 className="text-3xl font-semibold">Interview submitted</h1><p className="text-secondary">Thank you, {attempt?.candidateName}. Your responses were saved and evaluated.</p></section></main>;

  if (!attempt) return <main className="min-h-screen bg-background px-6 py-12 text-foreground"><section className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-border bg-surface p-8 shadow-xl"><div className="flex justify-end"><ThemeToggle /></div><h1 className="text-3xl font-semibold">{details?.title}</h1><p className="text-secondary">{details?.role} · {details?.durationMinutes} minutes · {details?.questionCount} questions</p><div className="flex flex-wrap gap-2">{details?.technologies.map((technology) => <span key={technology.name} className="rounded-full bg-surface-hover px-3 py-1 text-sm">{technology.name} · {technology.level}</span>)}</div><label className="block space-y-2"><span className="font-medium">Your name</span><input value={candidateName} onChange={(event) => setCandidateName(event.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-3" placeholder="Enter your full name" /></label><p className="text-sm text-secondary">The timer starts when you begin. You will receive a different set of questions from every other candidate.</p><button type="button" disabled={starting} onClick={() => void startInterview()} className="w-full rounded-lg bg-brand px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50">{starting ? "Generating your questions..." : "Start interview"}</button></section></main>;

  if (!currentQuestion) return <main className="grid min-h-screen place-items-center bg-background text-foreground">Preparing question {questions.length}...</main>;

  return <div className="min-h-screen bg-background px-6 py-8 text-foreground"><main className="mx-auto max-w-4xl space-y-6"><div className="flex justify-end"><ThemeToggle /></div><div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4"><div><p className="text-sm text-secondary">{attempt.title}</p><p className="font-medium">{attempt.candidateName}</p></div><div className="text-right"><p className="text-xs uppercase tracking-wide text-secondary">Time remaining</p><p className={`text-2xl font-bold tabular-nums ${timeLeft < 5 * 60_000 ? "text-error" : "text-brand"}`}>{formatTime(timeLeft)}</p></div></div><ProgressHeader current={currentIndex + 1} total={questions.length} answered={Object.values(answers).filter((answer) => answer.trim()).length} timeLeft={formatTime(timeLeft)} /><QuestionCard category={currentIndex === 0 ? "Introduction" : currentQuestion.followUpToQuestionId ? "Follow-up" : "Interview question"} difficulty="Configured per technology" question={currentQuestion.questionText} /><AnswerBox key={currentQuestion._id} value={answers[currentQuestion._id] || ""} onChange={(value) => setAnswers((existing) => ({ ...existing, [currentQuestion._id]: value }))} /><div className="flex flex-wrap justify-between gap-3"><button type="button" onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))} disabled={currentIndex === 0} className="rounded-lg border border-border px-5 py-2 disabled:opacity-40">Previous</button>{currentIndex > 0 && currentQuestion.order !== 1 && <button type="button" onClick={() => void requestFollowUp()} disabled={submitting} className="rounded-lg border border-border px-5 py-2">Request only if unclear</button>}<button type="button" onClick={() => void goNext()} disabled={submitting} className="rounded-lg bg-brand px-5 py-2 font-semibold text-primary-foreground disabled:opacity-50">{submitting ? "Please wait..." : currentIndex === questions.length - 1 ? "Submit interview" : "Next question"}</button></div>{error && <p className="text-sm text-error" role="alert">{error}</p>}</main></div>;
}
