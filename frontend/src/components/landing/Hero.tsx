import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative text-center py-28 px-6 overflow-hidden">
      
      <div className="inline-block mb-6 px-4 py-1 text-sm rounded-full bg-surface border border-border text-text-secondary">
        ✨ Powered by Dikshit Yadav · Free to start
      </div>

      <h1 className="text-5xl md:text-6xl font-bold leading-tight max-w-4xl mx-auto">
        Ace your next <br />
        interview with an{" "}
        <span className="text-brand">
          AI coach
        </span>
      </h1>

      <p className="text-gray-400 max-w-2xl mx-auto mt-6 text-lg">
        Realistic mock interviews for any tech role. Get instant scoring,
        gap analysis, and a personalized roadmap — built for students who
        want to actually get hired.
      </p>

      <div className="flex justify-center gap-4 mt-8 flex-wrap">
        <Button className="px-6 py-5 text-base bg-brand text-primary-foreground hover:bg-brand-hover"
          onClick={() => navigate("/signup")}>
          Start mock interview →
        </Button>

        <Button
          variant="outline"
          className="px-6 py-5 text-base border-border text-text-primary hover:bg-surface-hover"
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