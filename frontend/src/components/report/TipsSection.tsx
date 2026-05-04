type Props = { report: any };

export default function TipsSection({ report }: Props) {
  return (
    <div className="p-6 bg-[#0b0f2a] border border-gray-800 rounded-xl">
      <h3 className="mb-4 font-semibold">General suggestions</h3>

      {report.tips?.map((tip: string, i: number) => (
        <p key={i} className="mb-2">• {tip}</p>
      ))}
    </div>
  );
}