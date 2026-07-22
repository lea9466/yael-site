import { z } from "zod";

export const PUBLIC_CONTACT_FULL_NAME_MAX = 150;
export const PUBLIC_CONTACT_EMAIL_MAX = 254;
export const PUBLIC_CONTACT_PHONE_MAX = 30;
export const PUBLIC_CONTACT_MESSAGE_MIN = 10;
export const PUBLIC_CONTACT_MESSAGE_MAX = 4000;

const privacyAcceptedSchema = z
  .boolean({
    message: "יש לאשר את מדיניות הפרטיות כדי לשלוח את הפנייה.",
  })
  .refine((value) => value === true, {
    message: "יש לאשר את מדיניות הפרטיות כדי לשלוח את הפנייה.",
  });

/** Client-side form schema — keeps phone as string for RHF. */
export const publicContactFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "יש להזין שם מלא")
    .max(PUBLIC_CONTACT_FULL_NAME_MAX, "השם ארוך מדי"),
  email: z
    .string()
    .trim()
    .min(1, "יש להזין כתובת אימייל תקינה")
    .max(PUBLIC_CONTACT_EMAIL_MAX, "כתובת האימייל ארוכה מדי")
    .email("יש להזין כתובת אימייל תקינה"),
  phone: z
    .string()
    .trim()
    .max(PUBLIC_CONTACT_PHONE_MAX, "מספר הטלפון ארוך מדי"),
  message: z
    .string()
    .trim()
    .min(PUBLIC_CONTACT_MESSAGE_MIN, "יש להזין הודעה")
    .max(PUBLIC_CONTACT_MESSAGE_MAX, "ההודעה ארוכה מדי"),
  privacy_policy_accepted: privacyAcceptedSchema,
});

/** Server submission schema including honeypot + normalized phone/email. */
export const publicContactMessageSchema = publicContactFormSchema
  .extend({
    company_website: z.string().optional().default(""),
  })
  .transform((value) => ({
    full_name: value.full_name,
    email: value.email.toLowerCase(),
    phone: value.phone.length > 0 ? value.phone : null,
    message: value.message,
    privacy_policy_accepted: value.privacy_policy_accepted as true,
    company_website: value.company_website ?? "",
  }));

export type PublicContactFormValues = z.infer<typeof publicContactFormSchema>;
export type PublicContactMessageInput = z.input<typeof publicContactMessageSchema>;
export type PublicContactMessageValues = z.output<typeof publicContactMessageSchema>;
