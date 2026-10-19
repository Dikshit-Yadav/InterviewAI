import { useNavigate } from "react-router-dom";
import {AuthService} from "../../services/authService";
export default function DashboardNavbar() {
  const navigate = useNavigate();
  const name = JSON.parse(sessionStorage.getItem("name") ?? '"User"');

  const handleLogout = async () => {
    try {
      sessionStorage.clear();
      await AuthService.logout();
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 bg-black/30 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold">
          <i className="fa-solid fa-brain"></i>
        </div>
        <span
          className="text-lg font-semibold cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          InterviewAI
        </span>
      </div>

      <div className="group relative flex items-center">
        <button
          className="flex items-center gap-3"
          onClick={() => navigate("/profile")}
          aria-label="Open profile menu"
          aria-haspopup="true"
        >
          <span className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-sm">
            {typeof name === "string" ? name.charAt(0).toUpperCase() : "U"}
          </span>
          <span className="hidden sm:inline text-sm text-gray-300">
            {name}
          </span>
        </button>
        <div className="invisible absolute right-0 top-full z-50 min-w-32 rounded-md border border-white/10 bg-[#0d0d2b] py-1 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <button
            className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white"
            onClick={() => navigate("/profile")}
          >
            <span>Profile</span>
          </button>
          <button
            className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white"
            onClick={handleLogout}
          >
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
