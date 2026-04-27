import RegisterForm from "@/components/auth/RegisterForm";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register() {
    const Navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0b0b1a] via-[#0d0d2b] to-black text-white px-4">
      
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center font-bold">
          <i className="fa-solid fa-brain"></i>
        </div>
        <h1 className="text-xl font-semibold" onClick={()=> Navigate("/")}>InterviewAI</h1>
      </div>

      {/* Form */}
      <RegisterForm />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
      />
    </div>
  );
}