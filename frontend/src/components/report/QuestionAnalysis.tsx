import type { InterviewReport } from "@/types/api";

type Props = { report: InterviewReport };

export default function QuestionAnalysis({ report }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Question-by-question</h3>

      {report.answers?.map((a, i) => (
        <div key={i} className="p-5 bg-surface border border-border rounded-xl">

          <h4 className="font-medium mb-2">
            Q{i + 1}. {a.question}
          </h4>

          <p className="text-sm text-gray-400 mb-2">
            Your answer: {a.userAnswer}
          </p>

          <p className="text-success">
            ✔ {a.aiEvaluation?.strengths}
          </p>

          <p className="text-warning">
            ⚠ {a.aiEvaluation?.weaknesses}
          </p>

          <p className="text-info mt-2">
            💡 {a.aiEvaluation?.correctAnswer}
          </p>

          <p className="text-sm mt-2">
            Score: {a.aiEvaluation?.score}/10
          </p>

        </div>
      ))}
    </div>
  );
}