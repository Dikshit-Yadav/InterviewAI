import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { interviewService, type TechnologyLevel } from "@/services/interviewServices";
import { getErrorMessage } from "@/lib/apiError";

const levels = ["Beginner", "Intermediate", "Advanced"] as const;

export default function SharedInterviewBuilder() {
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [interviewType, setInterviewType] = useState<"Technical Interview" | "HR Interview" | "System Design Interview" | "Behavioral Interview">("Technical Interview");
  const [technologies, setTechnologies] = useState<TechnologyLevel[]>([{ name: "", level: "Beginner" }]);
  const [questionCount, setQuestionCount] = useState(10);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [createdLink, setCreatedLink] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void interviewService.getSharedInterviews().then((templates) => {
      if (templates.length) setCreatedLink(templates[0].shareUrl);
    }).catch(() => undefined);
  }, []);

  const updateTechnology = (index: number, value: Partial<TechnologyLevel>) => {
    setTechnologies((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...value } : item));
  };

  const createInterview = async () => {
    const validTechnologies = technologies.filter((item) => item.name.trim());
    if (title.trim().length < 3 || role.trim().length < 1 || validTechnologies.length === 0) {
      toast.error("Add a title, role, and at least one technology.");
      return;
    }
    setSaving(true);
    try {
      const created = await interviewService.createSharedInterview({
        title: title.trim(),
        role: role.trim(),
        interviewType,
        technologies: validTechnologies.map((item) => ({ name: item.name.trim(), level: item.level })),
        questionCount,
        durationMinutes,
      });
      setCreatedLink(created.shareUrl);
      toast.success("Interview link created.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create the interview link."));
    } finally {
      setSaving(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(createdLink);
    toast.success("Link copied.");
  };

  return <div className="min-h-screen bg-background text-foreground">
    <DashboardNavbar />
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold">Create shareable interview</h1>
      <p className="mt-2 text-secondary">Every candidate receives unique questions and an independent timed attempt.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <label className="space-y-2"><span className="font-medium">Test title</span><input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-lg border border-border bg-surface px-4 py-3" placeholder="Frontend Developer Assessment" /></label>
        <label className="space-y-2"><span className="font-medium">Target role</span><input value={role} onChange={(event) => setRole(event.target.value)} className="w-full rounded-lg border border-border bg-surface px-4 py-3" placeholder="Frontend Developer" /></label>
        <label className="space-y-2"><span className="font-medium">Interview type</span><select value={interviewType} onChange={(event) => setInterviewType(event.target.value as typeof interviewType)} className="w-full rounded-lg border border-border bg-surface px-4 py-3"><option>Technical Interview</option><option>HR Interview</option><option>System Design Interview</option><option>Behavioral Interview</option></select></label>
        <div className="grid grid-cols-2 gap-4">
          <label className="space-y-2"><span className="font-medium">Questions</span><input type="number" min={3} max={50} value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} className="w-full rounded-lg border border-border bg-surface px-4 py-3" /></label>
          <label className="space-y-2"><span className="font-medium">Minutes</span><input type="number" min={5} max={480} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} className="w-full rounded-lg border border-border bg-surface px-4 py-3" /></label>
        </div>
      </div>
      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Technology stack and levels</h2>
        {technologies.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[1fr_220px_auto]">
          <input value={item.name} onChange={(event) => updateTechnology(index, { name: event.target.value })} className="rounded-lg border border-border bg-surface px-4 py-3" placeholder="JavaScript, Node.js, React..." />
          <select value={item.level} onChange={(event) => updateTechnology(index, { level: event.target.value as TechnologyLevel["level"] })} className="rounded-lg border border-border bg-surface px-4 py-3">{levels.map((level) => <option key={level}>{level}</option>)}</select>
          <button type="button" onClick={() => setTechnologies((current) => current.filter((_, itemIndex) => itemIndex !== index))} disabled={technologies.length === 1} className="rounded-lg px-3 text-error disabled:opacity-30">Remove</button>
        </div>)}
        {technologies.length < 20 && <button type="button" onClick={() => setTechnologies((current) => [...current, { name: "", level: "Beginner" }])} className="rounded-lg border border-border px-4 py-2">+ Add technology</button>}
      </section>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void createInterview()} disabled={saving} className="rounded-lg bg-brand px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Creating..." : "Create interview link"}</button>
        {createdLink && <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-surface p-2"><input readOnly value={createdLink} className="min-w-0 flex-1 bg-transparent px-2 text-sm" /><button type="button" onClick={() => void copyLink()} className="rounded-md bg-surface-hover px-3 py-2">Copy</button></div>}
      </div>
    </main>
  </div>;
}
