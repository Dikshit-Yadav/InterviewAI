import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email")
  .max(254, "Email is too long");
const passwordSchema = z
  .string()
  .max(128, "Password is too long")
  .refine((value) => value.length >= 8, {
    message: "Password must be at least 8 characters",
  })
  .refine((value) => /[A-Z]/.test(value), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((value) => /\d/.test(value), {
    message: "Password must contain at least one digit",
  })
  .refine((value) => /[^A-Za-z0-9\s]/.test(value), {
    message: "Password must contain at least one special character",
  });

export const emailOnlySchema = z.object({ email: emailSchema });
export const emailOtpSchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
});
export const passwordResetSchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
  password: z
    .string()
    .min(1, "Password is required")
    .pipe(passwordSchema),
});

export const loginSchema = z
  .object({
    email: z.string().trim(),
    password: z.string().max(128, "Password is too long"),
  })
  .superRefine(({ email, password }, ctx) => {
    if (!email && !password) {
      ctx.addIssue({ code: "custom", message: "All fields are required" });
      return;
    }

    if (!password) {
      ctx.addIssue({ code: "custom", message: "Password is required" });
    } else {
      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        ctx.addIssue({
          code: "custom",
          message: passwordValidation.error.issues[0].message,
        });
      }
    }

    if (!email) {
      ctx.addIssue({
        code: "custom",
        message: "Email is required",
      });
    } else if (!emailSchema.safeParse(email).success) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid email" });
    }
  });

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .pipe(passwordSchema),
  targetRole: z
    .string()
    .trim()
    .min(1, "Target role is required")
    .max(100, "Target role is too long"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  targetRole: z
    .string()
    .trim()
    .min(1, "Target role is required")
    .max(100, "Target role is too long"),
});

const resumeTextSchema = z.string().trim().max(2000, "Keep this under 2,000 characters");
const optionalResumeTextSchema = resumeTextSchema.optional().default("");

export const resumeBuilderSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  headline: z.string().trim().min(1, "Professional title is required").max(120),
  email: z
    .string()
    .trim()
    .max(254, "Email is too long")
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address",
    }),
  phone: z.string().trim().max(40),
  location: z.string().trim().max(120),
  linkedin: z.string().trim().max(300),
  github: z.string().trim().max(300),
  summary: z.string().trim().min(1, "Professional summary is required").max(2000),
  skills: z.object({
    languages: optionalResumeTextSchema,
    frontend: optionalResumeTextSchema,
    backend: optionalResumeTextSchema,
    testing: optionalResumeTextSchema,
    databases: optionalResumeTextSchema,
    competencies: optionalResumeTextSchema,
  }),
  experience: z.array(
    z.object({
      role: z.string().trim().min(1, "Role is required").max(120),
      company: z.string().trim().min(1, "Company is required").max(120),
      dates: z.string().trim().min(1, "Dates are required").max(100),
      location: optionalResumeTextSchema,
      bullets: z.string().trim().min(1, "Add at least one accomplishment").max(4000),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string().trim().min(1, "Project name is required").max(120),
      links: optionalResumeTextSchema,
      technologies: optionalResumeTextSchema,
      bullets: z.string().trim().min(1, "Add at least one project detail").max(4000),
    }),
  ),
  education: z
    .array(
      z.object({
        degree: z.string().trim().min(1, "Degree is required").max(120),
        institution: z.string().trim().min(1, "Institution is required").max(160),
        dates: z.string().trim().min(1, "Dates are required").max(100),
        location: optionalResumeTextSchema,
      }),
    )
    .min(1, "Add at least one education entry"),
});

export type ResumeBuilderData = z.infer<typeof resumeBuilderSchema>;

export const interviewStartSchema = z.object({
  role: z.string().trim().min(1, "Choose a target role").max(100),
  technologies: z
    .string()
    .trim()
    .max(500, "List up to 500 characters of technologies")
    .optional()
    .default(""),
  experience: z.enum(["Beginner", "Intermediate", "Advanced"], {
    error: "Choose a valid experience level",
  }),
  interviewType: z.enum(
    [
      "Technical Interview",
      "HR Interview",
      "System Design Interview",
      "Behavioral Interview",
    ],
    { error: "Choose a valid interview type" }
  ),
});

export const interviewIdSchema = z.string().regex(/^[a-f\d]{24}$/i, {
  message: "Invalid interview id",
});

export const submitAnswersSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: interviewIdSchema,
        answer: z.string().max(10_000, "An answer cannot exceed 10,000 characters"),
      })
    )
    .min(1, "Answers are required")
    .max(100, "Too many answers"),
});

export const answerDraftSchema = z
  .record(
    interviewIdSchema,
    z.string().max(10_000, "An answer cannot exceed 10,000 characters")
  )
  .refine((draft) => Object.keys(draft).length <= 100, {
    message: "Too many saved answers",
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type InterviewStartData = z.infer<typeof interviewStartSchema>;
export type SubmitAnswersData = z.infer<typeof submitAnswersSchema>;
