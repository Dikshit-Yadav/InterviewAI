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
  .refine((value) => value.trim().length >= 8, {
    message: "Password must be at least 8 characters",
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

export const googleCallbackQuerySchema = z.object({
  state: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  error: z.string().min(1).optional(),
});
