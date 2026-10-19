type Props = { report: any };

export default function LearningPath({ report }: Props) {
  return (
    <div className="p-6 bg-surface border border-border rounded-xl">
      <h3 className="mb-4 font-semibold">Recommended learning path</h3>

      {report.learningPath?.map((step: string, i: number) => (
        <div key={i} className="mb-3 flex gap-3">
          <span className="text-brand">{i + 1}.</span>
          <p>{step}</p>
        </div>
      ))}
    </div>
  );
}