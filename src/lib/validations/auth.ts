import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "יש להזין כתובת אימייל")
    .email("כתובת האימייל אינה תקינה"),
  password: z.string().min(1, "יש להזין סיסמה"),
  rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
