import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ProgressHeader from "@/components/session/ProgressHeader";
import QuestionCard from "@/components/session/QuestionCard";
import AnswerBox from "@/components/session/AnswerBox";
import NavigationControls from "@/components/session/NavigationControls";

import { interviewService } from "@/services/interviewServices";
import { answerDraftSchema } from "@/lib/validation";
import ThemeToggle from "@/components/ui/ThemeToggle";

type Question = {
  _id: string;
  questionText: string;
  order: number;
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

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // runs once, on the last question: send every answer to the backend,
  // which sends them to the AI and returns the finished report.
  const handleFinish = async () => {
    if (!interviewId || submitting) return;

    if (answeredCount === 0) {
      setError("Write at least one answer before finishing.");
      return;
    }

    const unanswered = questions.length - answeredCount;
    if (
      unanswered > 0 &&
      !window.confirm(
        `${unanswered} question(s) are unanswered and will score 0. Submit anyway?`
      )
    ) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await interviewService.submitInterview(
        interviewId,
        questions.map((q) => ({
          questionId: q._id,
          answer: (answers[q._id] ?? "").trim(),
        }))
      );

      localStorage.removeItem(draftKey(interviewId));
      navigate(`/report/${interviewId}`);
    } catch (err: any) {
      console.error("Submit failed", err);
      setError(
        err?.response?.data?.message ||
          "Something went wrong while evaluating your answers. Your answers are still saved - please try again."
      );
      setSubmitting(false);
    }
  };

  if (!questions.length) {
    return (
      <div className="bg-background text-foreground p-10">{error ?? "Loading..."}</div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        <ProgressHeader
          current={currentIndex + 1}
          total={questions.length}
          answered={answeredCount}
          timeLeft="3:53"
        />

        <QuestionCard
          category="AI Generated"
          difficulty="Dynamic"
          question={currentQuestion.questionText}
        />

        <AnswerBox
          key={currentQuestion._id}
          value={answers[currentQuestion._id] || ""}
          onChange={handleAnswerChange}
        />

        {error && <p className="text-sm text-error">{error}</p>}
        {submitting && (
          <p className="text-sm text-gray-400">
            Evaluating your answers with AI - this can take a few seconds...
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
