import {useNavigate} from "react-router-dom";

export default function DashboardNavbar() {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 border-b border-white/10 bg-black/30 backdrop-blur">
      
      <div className="flex items-center gap-2" >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold" >
          <i className="fa-solid fa-brain"></i>
        </div>
        <span className="font-semibold cursor-pointer" onClick={() => navigate("/dashboard")}>InterviewAI</span>
      </div>

      {/* user */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-sm">
          D
        </div>
        <span className="text-sm text-gray-300 cursor-pointer">
          {JSON.parse(sessionStorage.getItem("user") || "null")}
        </span>
      </div>

    </div>
  );
}