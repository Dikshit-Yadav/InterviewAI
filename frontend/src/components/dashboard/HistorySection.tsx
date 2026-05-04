import {useNavigate} from "react-router-dom"
type Props = {
  history: any[];
};

export default function HistorySection({ history }: Props) {
  const navigate = useNavigate();
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5 mt-8">
      <h3 className="font-semibold mb-4">Interview history</h3>

      {history.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No interviews yet
        </div>
      ) : (
        history.map((h) => (
          <div
            key={h._id}
            onClick={() => navigate(`/report/${h._id}`)}
            className="mb-3 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{h.role}</p>
                <p className="text-sm text-gray-400">
                  {h.experience} • {h.interviewType}
                </p>
              </div>

              <span className="text-sm text-gray-500">
                {new Date(h.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}