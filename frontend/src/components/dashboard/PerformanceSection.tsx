export default function PerformanceSection() {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5 h-[300px]">
      <h3 className="font-semibold mb-2">Performance trend</h3>
      <p className="text-gray-400 text-sm mb-4">
        Score across your last interviews
      </p>

      <div className="flex items-center justify-center h-full text-gray-500">
        Complete your first interview to see your trend.
      </div>
    </div>
  );
}