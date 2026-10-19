import LoginForm from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Login() {
  const Navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-lg bg-brand text-primary-foreground flex items-center justify-center font-bold">
          <i className="fa-solid fa-brain"></i>
        </div>
        <h1 className="text-xl font-semibold" onClick={()=> Navigate("/")}>InterviewAI</h1>
      </div>

      <LoginForm />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
      />
    </div>
  );
}