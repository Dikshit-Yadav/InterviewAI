type Props = {
  data: any;
};

export default function StatsCards({ data }: Props) {
  const stats = [
    { title: "Interviews", value: data.totalInterviews },
    { title: "Average score", value: data.avgScore?.toFixed(1) },
    { title: "Strongest skill", value: "NodeJs" },
    { title: "Weakest skill", value: "java" },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {stats.map((s, i) => (
        <div key={i} className="p-6 rounded-xl border border-white/10 bg-white/5">
          <p className="text-gray-400 text-sm mb-2">{s.title}</p>
          <h2 className="text-2xl font-bold">{s.value}</h2>
        </div>
      ))}
    </div>
  );
}