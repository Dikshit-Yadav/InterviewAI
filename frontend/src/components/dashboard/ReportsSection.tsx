type Props = {
  reports: any[];
};

export default function ReportsSection({ reports }: Props) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5 h-[300px] overflow-y-auto">
      <h3 className="font-semibold mb-4">Recent reports</h3>

      {reports.length === 0 ? (
        <div className="text-gray-500">No reports yet.</div>
      ) : (
        reports.map((r) => (
          <div key={r._id} className="mb-3 p-3 bg-white/5 rounded-lg">
            Score: {r.averageScore}
          </div>
        ))
      )}
    </div>
  );
}