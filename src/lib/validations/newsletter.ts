import { z } from "zod";

export const NEWSLETTER_FULL_NAME_MAX = 150;
export const NEWSLETTER_EMAIL_MAX = 254;

const marketingConsentSchema = z
  .boolean({
    message: "יש לאשר קבלת דיוור כדי להירשם.",
  })
  .refine((value) => value === true, {
    message: "יש לאשר קבלת דיוור כדי להירשם.",
  });

/** Client-side form schema. */
export const newsletterSignupFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "יש להזין שם")
    .max(NEWSLETTER_FULL_NAME_MAX, "השם ארוך מדי"),
  email: z
    .string()
    .trim()
    .min(1, "יש להזין כתובת אימייל תקינה")
    .max(NEWSLETTER_EMAIL_MAX, "כתובת האימייל ארוכה מדי")
    .email("יש להזין כתובת אימייל תקינה"),
  marketing_consent: marketingConsentSchema,
});

/** Server submission schema including honeypot + normalized email. */
export const newsletterSignupSchema = newsletterSignupFormSchema
  .extend({
    company_website: z.string().optional().default(""),
  })
  .transform((value) => ({
    full_name: value.full_name,
    email: value.email.toLowerCase(),
    marketing_consent: value.marketing_consent as true,
    company_website: value.company_website ?? "",
  }));

export type NewsletterSignupFormValues = z.infer<
  typeof newsletterSignupFormSchema
>;
export type NewsletterSignupInput = z.input<typeof newsletterSignupSchema>;
export type NewsletterSignupValues = z.output<typeof newsletterSignupSchema>;
