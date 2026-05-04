"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Props = {
  reports: any[];
};

export default function PerformanceSection({ reports }: Props) {
  const data = reports.map((r, index) => ({
    name: `#${index + 1}`,
    score: r.averageScore || 0,
  }));

  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5 h-[450px]">
      <h3 className="font-semibold mb-2">Performance trend</h3>
      <p className="text-gray-400 text-sm mb-4">
        Score across your last interviews
      </p>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500  ">
          Complete your first interview to see your trend.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="90%" >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />

            <XAxis dataKey="name" stroke="#aaa" />
            <YAxis stroke="#aaa" domain={[0, 10]} />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}