"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import { publicationStatusToPublished } from "@/lib/testimonials/format";
import { TESTIMONIAL_ERRORS } from "@/lib/testimonials/errors";
import {
  fetchTestimonialById,
  searchTestimonials,
  verifyServiceExists,
} from "@/lib/testimonials/queries";
import type { TestimonialActionResult } from "@/lib/testimonials/types";
import {
  createTestimonialSchema,
  deleteTestimonialSchema,
  linkTestimonialToServiceSchema,
  mapZodErrors,
  searchTestimonialsSchema,
  unlinkTestimonialFromServiceSchema,
  updateTestimonialSchema,
  type TestimonialInput,
} from "@/lib/validations/testimonial";

async function getAdminSupabase(): Promise<{
  supabase: SupabaseClient;
} | null> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return null;
  }

  const supabase = await createClient();

  return { supabase };
}

function revalidateTestimonialPaths(
  testimonialId?: string,
  serviceId?: string | null
) {
  revalidatePath("/admin/testimonials");

  if (testimonialId) {
    revalidatePath(`/admin/testimonials/${testimonialId}`);
  }

  if (serviceId) {
    revalidatePath(`/admin/services/${serviceId}`);
  }

  revalidatePath("/admin/services", "layout");
}

function mapDatabaseError(): TestimonialActionResult {
  return {
    success: false,
    error: TESTIMONIAL_ERRORS.generic,
  };
}

function toDatabasePayload(input: TestimonialInput) {
  return {
    name: input.name,
    city: input.city.length > 0 ? input.city : null,
    content: input.content,
    service_id: input.service_id,
    featured: input.featured,
    is_published: publicationStatusToPublished(input.publication_status),
  };
}

async function validateServiceRelation(
  serviceId: string | null
): Promise<TestimonialActionResult | null> {
  const serviceExists = await verifyServiceExists(serviceId);

  if (!serviceExists) {
    return {
      success: false,
      error: TESTIMONIAL_ERRORS.invalidService,
      fieldErrors: { service_id: TESTIMONIAL_ERRORS.invalidService },
    };
  }

  return null;
}

export async function createTestimonialAction(
  input: TestimonialInput
): Promise<TestimonialActionResult> {
  const parsed = createTestimonialSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: TESTIMONIAL_ERRORS.unauthorized };
  }

  const serviceError = await validateServiceRelation(parsed.data.service_id);

  if (serviceError) {
    return serviceError;
  }

  const { supabase } = adminContext;
  const { data, error } = await supabase
    .from("testimonials")
    .insert(toDatabasePayload(parsed.data))
    .select("id")
    .single();

  if (error || !data) {
    return mapDatabaseError();
  }

  revalidateTestimonialPaths(data.id, parsed.data.service_id);

  return { success: true, data: { id: data.id } };
}

export async function updateTestimonialAction(
  input: TestimonialInput & { id: string }
): Promise<TestimonialActionResult> {
  const parsed = updateTestimonialSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: TESTIMONIAL_ERRORS.unauthorized };
  }

  const existing = await fetchTestimonialById(parsed.data.id);

  if (!existing) {
    return { success: false, error: TESTIMONIAL_ERRORS.notFound };
  }

  const serviceError = await validateServiceRelation(parsed.data.service_id);

  if (serviceError) {
    return serviceError;
  }

  const { supabase } = adminContext;
  const { error } = await supabase
    .from("testimonials")
    .update(toDatabasePayload(parsed.data))
    .eq("id", parsed.data.id);

  if (error) {
    return mapDatabaseError();
  }

  revalidateTestimonialPaths(
    parsed.data.id,
    parsed.data.service_id ?? existing.service_id
  );

  if (existing.service_id && existing.service_id !== parsed.data.service_id) {
    revalidateTestimonialPaths(parsed.data.id, existing.service_id);
  }

  return { success: true, data: { id: parsed.data.id } };
}

export async function deleteTestimonialAction(input: {
  id: string;
}): Promise<TestimonialActionResult> {
  const parsed = deleteTestimonialSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: TESTIMONIAL_ERRORS.generic,
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: TESTIMONIAL_ERRORS.unauthorized };
  }

  const existing = await fetchTestimonialById(parsed.data.id);

  if (!existing) {
    return { success: false, error: TESTIMONIAL_ERRORS.notFound };
  }

  const { supabase } = adminContext;
  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", existing.id);

  if (error) {
    return mapDatabaseError();
  }

  revalidateTestimonialPaths(existing.id, existing.service_id);

  return { success: true };
}

export async function linkTestimonialToServiceAction(input: {
  testimonialId: string;
  serviceId: string;
  confirmMove?: boolean;
}): Promise<TestimonialActionResult> {
  const parsed = linkTestimonialToServiceSchema.safeParse({
    testimonialId: input.testimonialId,
    serviceId: input.serviceId,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: TESTIMONIAL_ERRORS.generic,
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: TESTIMONIAL_ERRORS.unauthorized };
  }

  const serviceError = await validateServiceRelation(parsed.data.serviceId);

  if (serviceError) {
    return serviceError;
  }

  const testimonial = await fetchTestimonialById(parsed.data.testimonialId);

  if (!testimonial) {
    return { success: false, error: TESTIMONIAL_ERRORS.notFound };
  }

  if (
    testimonial.service_id &&
    testimonial.service_id !== parsed.data.serviceId
  ) {
    if (!input.confirmMove) {
      return {
        success: false,
        error: `שייכת כרגע לשירות: ${testimonial.serviceTitle ?? "שירות אחר"}`,
        conflict: {
          currentServiceId: testimonial.service_id,
          currentServiceTitle:
            testimonial.serviceTitle ?? "שירות אחר",
        },
      };
    }
  }

  if (testimonial.service_id === parsed.data.serviceId) {
    return { success: true, data: { id: testimonial.id } };
  }

  const { supabase } = adminContext;
  const previousServiceId = testimonial.service_id;
  const { error } = await supabase
    .from("testimonials")
    .update({ service_id: parsed.data.serviceId })
    .eq("id", testimonial.id);

  if (error) {
    return mapDatabaseError();
  }

  revalidateTestimonialPaths(testimonial.id, parsed.data.serviceId);

  if (previousServiceId && previousServiceId !== parsed.data.serviceId) {
    revalidateTestimonialPaths(testimonial.id, previousServiceId);
  }

  return { success: true, data: { id: testimonial.id } };
}

export async function unlinkTestimonialFromServiceAction(input: {
  testimonialId: string;
  serviceId: string;
}): Promise<TestimonialActionResult> {
  const parsed = unlinkTestimonialFromServiceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: TESTIMONIAL_ERRORS.generic,
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: TESTIMONIAL_ERRORS.unauthorized };
  }

  const testimonial = await fetchTestimonialById(parsed.data.testimonialId);

  if (!testimonial) {
    return { success: false, error: TESTIMONIAL_ERRORS.notFound };
  }

  if (testimonial.service_id !== parsed.data.serviceId) {
    return { success: false, error: TESTIMONIAL_ERRORS.notFound };
  }

  const { supabase } = adminContext;
  const { error } = await supabase
    .from("testimonials")
    .update({ service_id: null })
    .eq("id", testimonial.id)
    .eq("service_id", parsed.data.serviceId);

  if (error) {
    return mapDatabaseError();
  }

  revalidateTestimonialPaths(testimonial.id, parsed.data.serviceId);

  return { success: true, data: { id: testimonial.id } };
}

export async function searchTestimonialsAction(input: {
  q: string;
  limit?: number;
}) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return [];
  }

  const parsed = searchTestimonialsSchema.safeParse(input);

  if (!parsed.success) {
    return [];
  }

  return searchTestimonials(parsed.data.q, {
    limit: parsed.data.limit,
  });
}
