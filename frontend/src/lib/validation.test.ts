import { describe, expect, it } from "vitest";
import {
  interviewStartSchema,
  loginSchema,
  registerSchema,
  resumeBuilderSchema,
} from "./validation";

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

  describe("interview start validation", () => {
    const setup = {
      role: "Frontend Developer",
      experience: "Intermediate",
      interviewType: "Technical Interview",
    };

    it("allows technologies to be omitted so the interview can ask for them", () => {
      expect(interviewStartSchema.parse(setup).technologies).toBe("");
    });

    it("accepts a candidate's technology list", () => {
      expect(
        interviewStartSchema.safeParse({
          ...setup,
          technologies: "HTML, CSS, Bootstrap, React",
        }).success,
      ).toBe(true);
    });

    it("rejects technology lists longer than 500 characters", () => {
      expect(
        interviewStartSchema.safeParse({
          ...setup,
          technologies: "a".repeat(501),
        }).success,
      ).toBe(false);
    });
  });

  describe("password validation", () => {
    const registration = {
      name: "Ada Example",
      email: "ada@example.com",
      targetRole: "Frontend Developer",
    };

    it("accepts passwords with all required character types and minimum length", () => {
      expect(
        registerSchema.safeParse({
          ...registration,
          password: "Secure1!x",
        }).success,
      ).toBe(true);
    });

    it.each([
      ["short", "Aa1!abc"],
      ["no uppercase", "secure1!x"],
      ["no lowercase", "SECURE1!X"],
      ["no number", "Secure!xx"],
      ["no special character", "Secure12x"],
    ])("rejects a password that is %s", (_reason, password) => {
      const result = registerSchema.safeParse({ ...registration, password });

      expect(result.success).toBe(false);
    });

    it("applies the same password policy at login", () => {
      expect(
        loginSchema.safeParse({
          email: "ada@example.com",
          password: "Secure1!x",
        }).success,
      ).toBe(true);
      expect(
        loginSchema.safeParse({
          email: "ada@example.com",
          password: "secure1!x",
        }).success,
      ).toBe(false);
    });
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
