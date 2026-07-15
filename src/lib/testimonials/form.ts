import {
  publishedToPublicationStatus,
} from "@/lib/testimonials/format";
import type { TestimonialDetail, TestimonialFormValues } from "@/lib/testimonials/types";

export function createEmptyTestimonialFormInput(
  serviceId: string | null = null
): TestimonialFormValues {
  return {
    name: "",
    city: "",
    content: "",
    service_id: serviceId,
    featured: false,
    publication_status: "draft",
  };
}

export function testimonialToFormInput(
  testimonial: TestimonialDetail
): TestimonialFormValues {
  return {
    name: testimonial.name,
    city: testimonial.city ?? "",
    content: testimonial.content,
    service_id: testimonial.service_id,
    featured: testimonial.featured,
    publication_status: publishedToPublicationStatus(testimonial.is_published),
  };
}
