const steps = [
  {
    no: "01",
    title: "Pick your role",
    desc: "Choose target role, experience level, and interview type.",
  },
  {
    no: "02",
    title: "Answer questions",
    desc: "5–7 AI-generated questions, one at a time, with a built-in timer.",
  },
  {
    no: "03",
    title: "Get your report",
    desc: "Instant scoring, gap analysis, and a personalized study plan.",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-8 py-20 max-w-6xl mx-auto border-t border-white/10">
      <h2 className="text-3xl font-bold text-center mb-2">
        How it works
      </h2>
      <p className="text-gray-400 text-center mb-12">
        From signup to scored report in under 15 minutes.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-white/10 bg-white/5"
          >
            <div className="text-purple-400 text-2xl font-bold mb-4">
              {step.no}
            </div>
            <h3 className="font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-gray-400">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}