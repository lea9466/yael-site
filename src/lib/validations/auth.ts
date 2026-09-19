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

export const PASSWORD_MIN_LENGTH = 10;
// bcrypt (used by Supabase Auth) ignores everything past 72 bytes.
export const PASSWORD_MAX_LENGTH = 72;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "יש להזין את הסיסמה הנוכחית"),
    newPassword: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `הסיסמה החדשה צריכה להכיל לפחות ${PASSWORD_MIN_LENGTH} תווים`
      )
      .max(
        PASSWORD_MAX_LENGTH,
        `הסיסמה החדשה יכולה להכיל עד ${PASSWORD_MAX_LENGTH} תווים`
      ),
    confirmPassword: z.string().min(1, "יש לאשר את הסיסמה החדשה"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "הסיסמאות אינן תואמות",
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    path: ["newPassword"],
    message: "הסיסמה החדשה חייבת להיות שונה מהנוכחית",
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
