import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-8 py-4 border-b border-border bg-background">
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-brand text-primary-foreground flex items-center justify-center font-bold">
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
        <ThemeToggle />
        <button
          className="text-sm text-text-secondary hover:text-text-primary"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

        <Button
          className="bg-brand text-primary-foreground hover:bg-brand-hover"
          onClick={() => navigate("/signup")}
        >
          Get started
        </Button>
      </div>
    </nav>
  );
}