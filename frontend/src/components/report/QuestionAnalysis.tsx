type Props = { report: any };

export default function QuestionAnalysis({ report }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Question-by-question</h3>

      {report.answers?.map((a: any, i: number) => (
        <div key={i} className="p-5 bg-[#0b0f2a] border border-gray-800 rounded-xl">

          <h4 className="font-medium mb-2">
            Q{i + 1}. {a.question}
          </h4>

          <p className="text-sm text-gray-400 mb-2">
            Your answer: {a.userAnswer}
          </p>

          <p className="text-green-400">
            ✔ {a.aiEvaluation?.strengths}
          </p>

          <p className="text-yellow-400">
            ⚠ {a.aiEvaluation?.weaknesses}
          </p>

          <p className="text-blue-400 mt-2">
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