type Props = { report: any };

export default function StrengthWeakness({ report }: Props) {
  return (
    <div className="grid md:grid-cols-2 gap-6">

      <div className="p-5 bg-[#0b0f2a] border border-green-500/20 rounded-xl">
        <h3 className="text-green-400 mb-3">Strong topics</h3>
        {report.strongTopics?.map((s: string, i: number) => (
          <p key={i}>✔ {s}</p>
        ))}
      </div>

      <div className="p-5 bg-[#0b0f2a] border border-yellow-500/20 rounded-xl">
        <h3 className="text-yellow-400 mb-3">Weak topics</h3>
        {report.weakTopics?.map((w: string, i: number) => (
          <p key={i}>⚠ {w}</p>
        ))}
      </div>

    </div>
  );
}