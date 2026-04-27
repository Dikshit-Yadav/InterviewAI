import { Brain, BarChart, Target, FileText, MessageSquare, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-generated questions",
    desc: "Tailored to your role, level and interview type — no two sessions are alike.",
  },
  {
    icon: BarChart,
    title: "Instant scoring",
    desc: "Technical correctness, clarity, depth, and confidence — graded in seconds.",
  },
  {
    icon: Target,
    title: "Personalized learning path",
    desc: "Spot weak topics and get a roadmap to fix them before the real interview.",
  },
  {
    icon: FileText,
    title: "Detailed reports",
    desc: "Strengths, gaps, model answers, and improvement tips for every question.",
  },
  {
    icon: MessageSquare,
    title: "All interview types",
    desc: "Technical, system design, behavioral, HR — practice the full loop.",
  },
  {
    icon: TrendingUp,
    title: "Track progress",
    desc: "See your scores trend, weakest skills, and confidence climb over time.",
  },
];

export default function Features() {
  return (
    <section className="px-8 py-20 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-2">
        Everything you need to prep
      </h2>
      <p className="text-gray-400 text-center mb-12">
        Built like a personal interview coach — without the price tag
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <f.icon className="w-6 h-6 mb-4 text-purple-400" />
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}