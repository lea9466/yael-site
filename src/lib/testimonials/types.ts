import type { TestimonialPublicationStatus } from "@/lib/testimonials/constants";
import type { ListTestimonialsQuery } from "@/lib/validations/testimonial";

export type TestimonialRecord = {
  id: string;
  name: string;
  city: string | null;
  content: string;
  service_id: string | null;
  featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type TestimonialListItem = TestimonialRecord & {
  serviceTitle: string | null;
};

export type ServiceTestimonialItem = TestimonialListItem;

export type TestimonialSearchResult = TestimonialListItem;

export type TestimonialDetail = TestimonialRecord & {
  serviceTitle: string | null;
};

export type ServiceOption = {
  id: string;
  title: string;
};

export type TestimonialsListData = {
  items: TestimonialListItem[];
  query: ListTestimonialsQuery;
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
};

export type TestimonialActionResult =
  | { success: true; data?: { id: string } }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
      conflict?: {
        currentServiceId: string;
        currentServiceTitle: string;
      };
    };

export type TestimonialFormValues = {
  name: string;
  city: string;
  content: string;
  service_id: string | null;
  featured: boolean;
  publication_status: TestimonialPublicationStatus;
};
