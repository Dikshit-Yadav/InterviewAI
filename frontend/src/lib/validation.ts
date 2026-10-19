import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email")
  .max(254, "Email is too long");
const passwordSchema = z
  .string()
  .max(128, "Password is too long")
  .refine((value) => value.trim().length >= 8, {
    message: "Password must be at least 8 characters",
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
    } else if (password.trim().length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 8 characters",
      });
    }

    if (!email) {
      ctx.addIssue({ code: "custom", message: "Email is required" });
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

export const interviewStartSchema = z.object({
  role: z.string().trim().min(1, "Choose a target role").max(100),
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
