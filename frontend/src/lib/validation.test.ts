import { describe, expect, it } from "vitest";
import { resumeBuilderSchema } from "./validation";

const validResume = {
  name: "Ada Example",
  headline: "Software Developer",
  email: "ada@example.com",
  phone: "",
  location: "London",
  linkedin: "",
  github: "",
  summary: "Software developer focused on accessible web applications.",
  skills: {
    languages: "TypeScript",
    frontend: "React",
    backend: "Node.js",
    testing: "Vitest",
    databases: "PostgreSQL",
    competencies: "Collaboration",
  },
  experience: [],
  projects: [],
  education: [
    {
      degree: "BSc Computer Science",
      institution: "Example University",
      dates: "2022–2026",
      location: "London",
    },
  ],
};

describe("resume builder validation", () => {
  it("accepts complete profile and education details", () => {
    expect(resumeBuilderSchema.safeParse(validResume).success).toBe(true);
  });

  it("rejects missing required details and invalid email addresses", () => {
    const result = resumeBuilderSchema.safeParse({
      ...validResume,
      name: "",
      email: "not-an-email",
      education: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Name is required");
      expect(messages).toContain("Enter a valid email address");
      expect(messages).toContain("Add at least one education entry");
    }
  });

  it("requires each added experience item to have its content", () => {
    const result = resumeBuilderSchema.safeParse({
      ...validResume,
      experience: [
        { role: "", company: "", dates: "", location: "", bullets: "" },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Add at least one accomplishment",
      );
    }
  });
});
