import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {useNavigate} from "react-router-dom";

import ProgressHeader from "@/components/session/ProgressHeader";
import QuestionCard from "@/components/session/QuestionCard";
import AnswerBox from "@/components/session/AnswerBox";
import NavigationControls from "@/components/session/NavigationControls";

import { interviewService } from "@/services/interviewServices"

export default function SessionPage() {
  const navigate = useNavigate();
  const { interviewId } = useParams();


  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isLastQuestion = currentIndex === questions.length - 1;
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (!interviewId) {
      console.error("Interview ID missing");
      return;
    }

    const fetchQuestions = async () => {
      const data = await interviewService.getQuestions(interviewId);
      setQuestions(data);
    };

    fetchQuestions();
  }, [interviewId]);

  const handleAnswerChange = (val: string) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: val,
    }));
  };

  const handleFinish = async () => {
    try {
      const res = await interviewService.generateReport(interviewId);

      navigate(`/report/${interviewId}`);
    } catch (err) {
      console.error("Report generation failed", err);
    }
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

  const handleSubmit = async () => {
    try {
      const answer = answers[currentQuestion._id];

      if (!answer) {
        alert("Please write an answer first");
        return;
      }

      await interviewService.submitAnswer({
        questionId: currentQuestion._id,
        interviewId,
        answer,
      });

      alert("Answer submitted!");
    } catch (err) {
      console.error("Submit failed", err);
    }
  };

  if (!questions.length) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">

        <ProgressHeader
          current={currentIndex + 1}
          total={questions.length}
          timeLeft="3:53"
        />

        <QuestionCard
          category="AI Generated"
          difficulty="Dynamic"
          question={currentQuestion.questionText}
        />

        <AnswerBox
          value={answers[currentQuestion._id] || ""}
          onChange={handleAnswerChange}
        />

        <NavigationControls
          onPrev={handlePrev}
          onNext={handleNext}
          isLast={isLastQuestion}
          onFinish={handleFinish}
          onSubmit={handleSubmit}
          disablePrev={currentIndex === 0}
        />
      </div>
    </div>
  );
}