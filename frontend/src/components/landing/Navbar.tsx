import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 border-b border-white/10 bg-black/30 backdrop-blur-md">
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold">
          <i className="fa-solid fa-brain"></i>
        </div>

        <span
          className="text-lg font-semibold cursor-pointer"
          onClick={() => navigate("/")}
        >
          InterviewAI
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="text-sm text-gray-300 hover:text-white"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        <Button
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90"
          onClick={() => navigate("/signup")}
        >
          Get started
        </Button>
      </div>
    </nav>
  );
}