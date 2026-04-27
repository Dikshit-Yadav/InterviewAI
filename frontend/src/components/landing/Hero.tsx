import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative text-center py-28 px-6 overflow-hidden">
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0b1a] via-[#0d0d2b] to-black -z-10" />

      <div className="inline-block mb-6 px-4 py-1 text-sm rounded-full bg-white/5 border border-white/10 text-gray-300">
        ✨ Powered by AI · Free to start
      </div>

      <h1 className="text-5xl md:text-6xl font-bold leading-tight max-w-4xl mx-auto">
        Ace your next <br />
        interview with an{" "}
        <span className="bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
          AI coach
        </span>
      </h1>

      <p className="text-gray-400 max-w-2xl mx-auto mt-6 text-lg">
        Realistic mock interviews for any tech role. Get instant scoring,
        gap analysis, and a personalized roadmap — built for students who
        want to actually get hired.
      </p>

      <div className="flex justify-center gap-4 mt-8 flex-wrap">
        <Button className="px-6 py-5 text-base bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90"
          onClick={() => navigate("/signup")}>
          Start mock interview →
        </Button>

        <Button
          variant="outline"
          className="px-6 py-5 text-base border-white/20 text-white hover:bg-white/10"
          onClick={() => navigate("/login")}
        >
          I already have an account
        </Button>
      </div>

      <div className="flex justify-center gap-6 mt-8 text-sm text-gray-400 flex-wrap">
        <div>✅ 7 roles</div>
        <div>✅ 4 interview types</div>
        <div>✅ Instant feedback</div>
      </div>
    </section>
  );
}