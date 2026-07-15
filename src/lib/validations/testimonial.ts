import { z } from "zod";

import {
  TESTIMONIAL_CITY_MAX,
  TESTIMONIAL_CONTENT_MAX,
  TESTIMONIAL_CONTENT_MIN,
  TESTIMONIAL_NAME_MAX,
  TESTIMONIAL_PUBLICATION_STATUSES,
  TESTIMONIALS_PAGE_SIZE,
} from "@/lib/testimonials/constants";
import { normalizeTestimonialContent } from "@/lib/testimonials/text";
import { mapZodErrors } from "@/lib/validations/service";

export { mapZodErrors };

export const TESTIMONIAL_STATUS_FILTERS = [
  "all",
  "published",
  "draft",
] as const;

export const TESTIMONIAL_SORT_VALUES = [
  "newest",
  "oldest",
  "name",
] as const;

export type TestimonialSortValue = (typeof TESTIMONIAL_SORT_VALUES)[number];
export type TestimonialStatusFilter =
  (typeof TESTIMONIAL_STATUS_FILTERS)[number];

const uuidSchema = z.string().uuid("מזהה אינו תקין");

const nullableUuidSchema = z
  .union([z.string().uuid("מזהה שירות אינו תקין"), z.null()])
  .or(z.literal("").transform(() => null));

const testimonialContentSchema = z
  .string()
  .transform((value) => normalizeTestimonialContent(value))
  .pipe(
    z
      .string()
      .min(TESTIMONIAL_CONTENT_MIN, "יש להזין טקסט המלצה")
      .max(TESTIMONIAL_CONTENT_MAX, "טקסט ההמלצה ארוך מדי")
  );

export const testimonialInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "יש להזין שם לקוח")
    .max(TESTIMONIAL_NAME_MAX, "שם הלקוח ארוך מדי"),
  city: z
    .string()
    .trim()
    .max(TESTIMONIAL_CITY_MAX, "שם העיר ארוך מדי"),
  content: testimonialContentSchema,
  service_id: nullableUuidSchema,
  featured: z.boolean(),
  publication_status: z.enum(TESTIMONIAL_PUBLICATION_STATUSES, {
    message: "יש לבחור סטטוס",
  }),
});

export type TestimonialInput = z.infer<typeof testimonialInputSchema>;

export const createTestimonialSchema = testimonialInputSchema;

export const updateTestimonialSchema = testimonialInputSchema.extend({
  id: uuidSchema,
});

export const deleteTestimonialSchema = z.object({
  id: uuidSchema,
});

export const linkTestimonialToServiceSchema = z.object({
  testimonialId: uuidSchema,
  serviceId: uuidSchema,
});

export const unlinkTestimonialFromServiceSchema = z.object({
  testimonialId: uuidSchema,
  serviceId: uuidSchema,
});

export const searchTestimonialsSchema = z.object({
  q: z.string().trim().max(120),
  excludeServiceId: uuidSchema.optional(),
  limit: z.number().int().min(1).max(30).optional(),
});

export const listTestimonialsQuerySchema = z.object({
  q: z.string().trim().max(120).catch(""),
  status: z.enum(TESTIMONIAL_STATUS_FILTERS).catch("all"),
  sort: z.enum(TESTIMONIAL_SORT_VALUES).catch("newest"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type ListTestimonialsQuery = z.infer<typeof listTestimonialsQuerySchema>;

export { TESTIMONIALS_PAGE_SIZE };
