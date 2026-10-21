import { useEffect, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ProgressHeader from "@/components/session/ProgressHeader";
import QuestionCard from "@/components/session/QuestionCard";
import AnswerBox from "@/components/session/AnswerBox";
import NavigationControls from "@/components/session/NavigationControls";

import { interviewService } from "@/services/interviewServices";
import { answerDraftSchema } from "@/lib/validation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import PageSkeleton from "@/components/ui/PageSkeleton";

type Question = {
  _id: string;
  questionText: string;
  order: number;
  followUpToQuestionId?: string;
};

// answers are kept in state (and mirrored to localStorage so a refresh
// doesn't lose them) until the user finishes the last question.
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
  if ((event.ctrlKey || event.metaKey) && ["c", "v", "x"].includes(event.key.toLowerCase())) {
    event.preventDefault();
  }
};

export default function SessionPage() {
  const navigate = useNavigate();
  const { interviewId } = useParams();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    loadDraft(interviewId)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleFinish = async () => {
    if (!interviewId || !currentQuestion || submitting) return;
    const introduction = questions.find((question) => question.order === 1);
    if (!answers[introduction?._id ?? ""]?.trim()) {
      setError("A brief introduction is required before you finish.");
      return;
    }

    const unanswered = questions.filter(
      (question) => !answers[question._id]?.trim(),
    ).length;
    if (
      unanswered > 0 &&
      !window.confirm(
        `${unanswered} question(s) are unanswered and will score 0. Finish the interview and generate your report?`,
      )
    ) {
      return;
    }

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
      localStorage.removeItem(draftKey(interviewId));
      navigate(`/report/${interviewId}`);
    } catch (err: any) {
      console.error("Could not finish interview", err);
      setError(
        err?.response?.data?.message ||
          "Could not finish the interview. Your answers are saved; please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!interviewId || !currentQuestion || submitting) return;
    if (currentIndex === questions.length - 1) {
      await handleFinish();
      return;
    }
    const answer = (answers[currentQuestion._id] ?? "").trim();
    if (currentQuestion.order === 1 && !answer) {
      setError("A brief introduction is required before you continue.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (
        answer.length >= 30 &&
        currentQuestion.order !== 1 &&
        !currentQuestion.followUpToQuestionId
      ) {
        const result = await interviewService.getAnswerFollowUp(
          interviewId,
          currentQuestion._id,
          answer
        );
        if (result.followUp) {
          const nextQuestions = questions.some(
            (question) => question._id === result.followUp?._id
          )
            ? questions
            : [
                ...questions.slice(0, currentIndex + 1),
                result.followUp,
                ...questions.slice(currentIndex + 1),
              ];
          setQuestions(nextQuestions);
          const followUpIndex = nextQuestions.findIndex(
            (question) => question._id === result.followUp?._id
          );
          setCurrentIndex(followUpIndex);
          return;
        }
      }

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((index) => index + 1);
      }
    } catch (err: any) {
      console.error("Could not continue interview", err);
      setError(
        err?.response?.data?.message ||
          "Could not continue the interview. Your answer is saved; please try again."
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
      className="min-h-screen bg-background text-foreground px-6 py-10"
      onCopy={preventClipboardAction}
      onCut={preventClipboardAction}
      onPaste={preventClipboardAction}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={preventClipboardShortcuts}
    >
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <p className="text-sm text-secondary" role="status">
          Copy and paste are disabled during the interview. Type or speak your
          own answers.
        </p>

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
        {error && <p className="text-sm text-error">{error}</p>}
        {submitting && (
          <p className="text-sm text-gray-400">
            Preparing your next question or report...
          </p>
        )}

        <NavigationControls
          onPrev={handlePrev}
          onNext={handleNext}
          onFinish={handleFinish}
          isLast={isLastQuestion}
          disablePrev={currentIndex === 0}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
