import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email")
  .max(254, "Email is too long");
const passwordSchema = z
  .string()
  .min(1, "Password is required")
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
const roleSchema = z
  .string()
  .trim()
  .min(1, "Target role is required")
  .max(100, "Target role is too long");
const interviewIdSchema = z.string().regex(/^[a-f\d]{24}$/i, {
  message: "Invalid interview id",
});

export const loginBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email: emailSchema,
  password: passwordSchema,
  targetRole: roleSchema,
});

export const emailBodySchema = z.object({ email: emailSchema });

export const verifyEmailOtpBodySchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
});

export const resetPasswordBodySchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
  password: passwordSchema,
});

export const profileBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  targetRole: roleSchema,
});

export const interviewStartBodySchema = z.object({
  role: roleSchema,
  technologies: z
    .string()
    .trim()
    .max(500, "Technologies cannot exceed 500 characters")
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

export const resumeInterviewBodySchema = z.object({
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

export const interviewIdParamsSchema = z.object({ id: interviewIdSchema });

export const submitAnswersBodySchema = z.object({
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

export const interviewFollowUpBodySchema = z.object({
  questionId: interviewIdSchema,
  answer: z.string().trim().min(1, "Answer the question before continuing").max(
    10_000,
    "An answer cannot exceed 10,000 characters"
  ),
});

export const interviewTechnologiesBodySchema = z.object({
  questionId: interviewIdSchema,
  technologies: z.string().trim().min(1, "List at least one technology").max(
    500,
    "Technologies cannot exceed 500 characters"
  ),
});

const levelSchema = z.enum(["Beginner", "Intermediate", "Advanced"]);

export const sharedInterviewCreateBodySchema = z.object({
  title: z.string().trim().min(3).max(120),
  role: roleSchema,
  interviewType: z.enum([
    "Technical Interview",
    "HR Interview",
    "System Design Interview",
    "Behavioral Interview",
  ]),
  technologies: z.array(z.object({
    name: z.string().trim().min(1).max(50),
    level: levelSchema,
    topics: z.array(z.string().trim().min(1).max(100)).min(1).max(20),
  })).min(1).max(20).refine(
    (items) => new Set(items.map((item) => item.name.toLowerCase())).size === items.length,
    "Each technology must be listed only once"
  ),
  questionCount: z.number().int().min(3).max(50),
  durationMinutes: z.number().int().min(5).max(480),
});

export const sharedInterviewJoinBodySchema = z.object({
  candidateName: z.string().trim().min(2).max(100),
});

export const sharedInterviewTokenSchema = z.object({
  token: z.string().regex(/^\d*[a-f0-9]{36,64}$/i, "Invalid interview link"),
});

export const sharedInterviewAttemptParamsSchema = z.object({ id: interviewIdSchema });

export const sharedAttemptAuthSchema = z.object({
  attemptToken: z.string().regex(/^\d*[a-f0-9]{64}$/i, "Invalid interview attempt token"),
});

export const googleCallbackQuerySchema = z.object({
  state: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  error: z.string().min(1).optional(),
});
