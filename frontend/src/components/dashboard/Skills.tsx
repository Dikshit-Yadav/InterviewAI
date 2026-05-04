type Props = {
  data: { skill: string; score: number }[];
};

export default function Skills({ data }: Props) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <h3 className="font-semibold mb-4">Skill Breakdown</h3>

      {data.length === 0 ? (
        <p className="text-gray-500">No data yet</p>
      ) : (
        data.map((s, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{s.skill}</span>
              <span>{s.score.toFixed(1)}/10</span>
            </div>

            <div className="w-full h-2 bg-gray-800 rounded">
              <div
                className="h-2 rounded bg-purple-500"
                style={{ width: `${(s.score / 10) * 100}%` }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}