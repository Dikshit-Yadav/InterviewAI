import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  resumeBuilderSchema,
  type ResumeBuilderData,
} from "@/lib/validation";

const emptyResume: ResumeBuilderData = {
  name: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  summary: "",
  skills: {
    languages: "",
    frontend: "",
    backend: "",
    testing: "",
    databases: "",
    competencies: "",
  },
  experience: [],
  projects: [],
  education: [],
};

const skillFields = [
  ["languages", "Languages"],
  ["frontend", "Front-end"],
  ["backend", "Back-end"],
  ["testing", "Testing & methodologies"],
  ["databases", "Databases & tools"],
  ["competencies", "Core competencies"],
] as const;

const inputClass =
  "mt-1 w-full rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Experience = ResumeBuilderData["experience"][number];
type Project = ResumeBuilderData["projects"][number];
type Education = ResumeBuilderData["education"][number];

function bullets(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function linkHref(value: string) {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function contactLink(value: string) {
  const href = linkHref(value);
  return href ? <a href={href}>{value}</a> : value;
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="resume-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export default function ResumeBuilder() {
  const [resume, setResume] = useState<ResumeBuilderData>(emptyResume);
  const [generated, setGenerated] = useState<ResumeBuilderData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const updateField = <K extends keyof ResumeBuilderData>(
    key: K,
    value: ResumeBuilderData[K],
  ) => {
    setResume((current) => ({ ...current, [key]: value }));
    setGenerated(null);
  };

  const updateSkills = (
    key: keyof ResumeBuilderData["skills"],
    value: string,
  ) => {
    setResume((current) => ({
      ...current,
      skills: { ...current.skills, [key]: value },
    }));
    setGenerated(null);
  };

  const updateExperience = (
    index: number,
    key: keyof Experience,
    value: string,
  ) => {
    const experience = resume.experience.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, [key]: value } : entry,
    );
    updateField("experience", experience);
  };

  const updateProject = (index: number, key: keyof Project, value: string) => {
    const projects = resume.projects.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, [key]: value } : entry,
    );
    updateField("projects", projects);
  };

  const updateEducation = (
    index: number,
    key: keyof Education,
    value: string,
  ) => {
    const education = resume.education.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, [key]: value } : entry,
    );
    updateField("education", education);
  };

  const generate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = resumeBuilderSchema.safeParse(resume);
    if (!result.success) {
      setErrors(result.error.issues.map((issue) => issue.message));
      setGenerated(null);
      return;
    }

    setErrors([]);
    setGenerated(result.data);
    setIsEditing(false);
    window.setTimeout(
      () =>
        document
          .getElementById("resume-print-preview")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      0,
    );
  };

  const downloadPdf = () => {
    document.body.classList.add("resume-printing");
    window.addEventListener(
      "afterprint",
      () => document.body.classList.remove("resume-printing"),
      { once: true },
    );
    window.print();
  };

  const textField = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: { multiline?: boolean; placeholder?: string; required?: boolean } = {},
  ) => (
    <label className="block text-sm font-medium text-foreground">
      {label}
      {options.multiline ? (
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={options.placeholder}
          required={options.required}
        />
      ) : (
        <input
          className={inputClass}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={options.placeholder}
          required={options.required}
        />
      )}
    </label>
  );

  const addExperience = () =>
    updateField("experience", [
      ...resume.experience,
      { role: "", company: "", dates: "", location: "", bullets: "" },
    ]);
  const addProject = () =>
    updateField("projects", [
      ...resume.projects,
      { name: "", links: "", technologies: "", bullets: "" },
    ]);
  const addEducation = () =>
    updateField("education", [
      ...resume.education,
      { degree: "", institution: "", dates: "", location: "" },
    ]);

  return (
    <section className="my-8 space-y-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Generate a resume</h2>
        <p className="mt-1 text-sm text-100">
          Add your details using the sections from the provided resume template.
          Your information is used only for the preview and is not uploaded or saved.
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setIsEditing((editing) => !editing)}
        aria-expanded={isEditing}
      >
        {isEditing ? "Close resume form" : generated ? "Edit resume" : "Build your resume"}
      </Button>

      {isEditing && (
        <form className="space-y-7" onSubmit={generate}>
        <section className="space-y-4">
          <h3 className="font-semibold text-foreground">Contact &amp; profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {textField("Full name", resume.name, (value) => updateField("name", value), {
              required: true,
            })}
            {textField(
              "Professional title",
              resume.headline,
              (value) => updateField("headline", value),
              { placeholder: "Full-Stack Developer", required: true },
            )}
            {textField("Email", resume.email, (value) => updateField("email", value), {
              placeholder: "name@example.com",
            })}
            {textField("Phone", resume.phone, (value) => updateField("phone", value), {
              placeholder: "+1 555 000 0000",
            })}
            {textField(
              "Location",
              resume.location,
              (value) => updateField("location", value),
              { placeholder: "City, Country" },
            )}
            {textField(
              "LinkedIn URL",
              resume.linkedin,
              (value) => updateField("linkedin", value),
              { placeholder: "linkedin.com/in/yourname" },
            )}
            {textField("GitHub URL", resume.github, (value) => updateField("github", value), {
              placeholder: "github.com/yourname",
            })}
          </div>
          {textField(
            "Professional summary",
            resume.summary,
            (value) => updateField("summary", value),
            {
              multiline: true,
              placeholder: "Summarize your experience, strengths, and focus.",
              required: true,
            },
          )}
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold text-foreground">Technical skills</h3>
          <p className="text-sm text-secondary">
            Enter related skills separated by commas for each category.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {skillFields.map(([key, label]) =>
              textField(label, resume.skills[key], (value) =>
                updateSkills(key, value),
              ),
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-foreground">Work experience</h3>
            <Button type="button" variant="outline" onClick={addExperience}>
              <Plus aria-hidden="true" /> Add experience
            </Button>
          </div>
          {resume.experience.map((entry, index) => (
            <div
              className="space-y-4 rounded-lg border border-border p-4"
              key={`experience-${index}`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {textField("Role", entry.role, (value) =>
                  updateExperience(index, "role", value),
                )}
                {textField("Company", entry.company, (value) =>
                  updateExperience(index, "company", value),
                )}
                {textField("Dates", entry.dates, (value) =>
                  updateExperience(index, "dates", value),
                  { placeholder: "Jan 2024 – Present" },
                )}
                {textField("Location (optional)", entry.location, (value) =>
                  updateExperience(index, "location", value),
                )}
              </div>
              {textField(
                "Accomplishments (one per line)",
                entry.bullets,
                (value) => updateExperience(index, "bullets", value),
                { multiline: true, required: true },
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  updateField(
                    "experience",
                    resume.experience.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                aria-label={`Remove experience ${index + 1}`}
              >
                <Trash2 aria-hidden="true" /> Remove
              </Button>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-foreground">Projects</h3>
            <Button type="button" variant="outline" onClick={addProject}>
              <Plus aria-hidden="true" /> Add project
            </Button>
          </div>
          {resume.projects.map((entry, index) => (
            <div
              className="space-y-4 rounded-lg border border-border p-4"
              key={`project-${index}`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {textField("Project name", entry.name, (value) =>
                  updateProject(index, "name", value),
                )}
                {textField("Project links (optional)", entry.links, (value) =>
                  updateProject(index, "links", value),
                  { placeholder: "Live demo URL, GitHub URL" },
                )}
                {textField(
                  "Technologies (optional)",
                  entry.technologies,
                  (value) => updateProject(index, "technologies", value),
                )}
              </div>
              {textField(
                "Project details (one per line)",
                entry.bullets,
                (value) => updateProject(index, "bullets", value),
                { multiline: true, required: true },
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  updateField(
                    "projects",
                    resume.projects.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                aria-label={`Remove project ${index + 1}`}
              >
                <Trash2 aria-hidden="true" /> Remove
              </Button>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-foreground">Education</h3>
            <Button type="button" variant="outline" onClick={addEducation}>
              <Plus aria-hidden="true" /> Add education
            </Button>
          </div>
          {resume.education.map((entry, index) => (
            <div
              className="space-y-4 rounded-lg border border-border p-4"
              key={`education-${index}`}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {textField("Degree", entry.degree, (value) =>
                  updateEducation(index, "degree", value),
                )}
                {textField("Institution", entry.institution, (value) =>
                  updateEducation(index, "institution", value),
                )}
                {textField("Dates", entry.dates, (value) =>
                  updateEducation(index, "dates", value),
                  { placeholder: "Expected 2026" },
                )}
                {textField("Location (optional)", entry.location, (value) =>
                  updateEducation(index, "location", value),
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  updateField(
                    "education",
                    resume.education.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                aria-label={`Remove education ${index + 1}`}
              >
                <Trash2 aria-hidden="true" /> Remove
              </Button>
            </div>
          ))}
        </section>

        {errors.length > 0 && (
          <div
            className="rounded-md border border-destructive p-4 text-sm text-destructive"
            role="alert"
          >
            <p className="font-semibold">Please complete the required fields:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {[...new Set(errors)].map((error, index) => (
                <li key={`${error}-${index}`}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          type="submit"
          className="bg-brand text-primary-foreground hover:bg-brand-hover"
        >
          Generate resume preview
        </Button>
        </form>
      )}

      {generated && (
        <section className="space-y-4 border-t border-border pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Resume preview
              </h3>
              <p className="text-sm text-secondary">
                Choose “Save as PDF” in the print dialog to download your resume.
              </p>
            </div>
            <Button
              type="button"
              className="bg-brand text-primary-foreground hover:bg-brand-hover"
              onClick={downloadPdf}
            >
              <Download aria-hidden="true" /> Download PDF
            </Button>
          </div>

          <article
            id="resume-print-preview"
            className="resume-paper mx-auto max-w-4xl bg-white p-8 text-black shadow-sm sm:p-12"
          >
            <header className="resume-header">
              <h1>{generated.name}</h1>
              <p className="resume-headline">{generated.headline}</p>
              <div className="resume-contact">
                {[generated.location, generated.phone, generated.email]
                  .filter(Boolean)
                  .join(" | ")}
                {generated.linkedin && (
                  <>
                    {" | "}
                    {contactLink(generated.linkedin)}
                  </>
                )}
                {generated.github && (
                  <>
                    {" | "}
                    {contactLink(generated.github)}
                  </>
                )}
              </div>
            </header>

            <ResumeSection title="Professional Summary">
              <p>{generated.summary}</p>
            </ResumeSection>

            {skillFields.some(([key]) => generated.skills[key].trim()) && (
              <ResumeSection title="Technical Skills">
                <div className="resume-skills">
                  {skillFields.map(([key, label]) =>
                    generated.skills[key].trim() ? (
                      <p key={key}>
                        <strong>{label}:</strong> {generated.skills[key]}
                      </p>
                    ) : null,
                  )}
                </div>
              </ResumeSection>
            )}

            {generated.experience.length > 0 && (
              <ResumeSection title="Work Experience">
                {generated.experience.map((entry, index) => (
                  <div className="resume-entry" key={`resume-experience-${index}`}>
                    <div className="resume-entry-heading">
                      <strong>
                        {entry.role} | {entry.company}
                      </strong>
                      <span>{entry.dates}</span>
                    </div>
                    {entry.location && <p className="resume-subline">{entry.location}</p>}
                    <ul>
                      {bullets(entry.bullets).map((bullet, bulletIndex) => (
                        <li key={`experience-bullet-${index}-${bulletIndex}`}>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </ResumeSection>
            )}

            {generated.projects.length > 0 && (
              <ResumeSection title="Projects">
                {generated.projects.map((entry, index) => (
                  <div className="resume-entry" key={`resume-project-${index}`}>
                    <div className="resume-entry-heading">
                      <strong>{entry.name}</strong>
                      {entry.links && <span>{entry.links}</span>}
                    </div>
                    {entry.technologies && (
                      <p className="resume-subline">{entry.technologies}</p>
                    )}
                    <ul>
                      {bullets(entry.bullets).map((bullet, bulletIndex) => (
                        <li key={`project-bullet-${index}-${bulletIndex}`}>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </ResumeSection>
            )}

            {generated.education.length > 0 && (
              <ResumeSection title="Education">
                {generated.education.map((entry, index) => (
                  <div className="resume-entry" key={`resume-education-${index}`}>
                    <div className="resume-entry-heading">
                      <strong>{entry.degree} | {entry.institution}</strong>
                      <span>{entry.dates}</span>
                    </div>
                    {entry.location && <p className="resume-subline">{entry.location}</p>}
                  </div>
                ))}
              </ResumeSection>
            )}
          </article>
        </section>
      )}
    </section>
  );
}
