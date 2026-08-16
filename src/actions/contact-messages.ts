"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import { CONTACT_MESSAGE_ERRORS } from "@/lib/contact-messages/errors";
import {
  fetchContactMessageById,
} from "@/lib/contact-messages/queries";
import { statusToIsRead } from "@/lib/contact-messages/status";
import type { ContactMessageActionResult } from "@/lib/contact-messages/types";
import {
  deleteContactMessageSchema,
  updateContactMessageStatusSchema,
} from "@/lib/validations/contact-message";

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

function revalidateContactMessagePaths(messageId?: string) {
  revalidatePath("/admin/contact-messages");

  if (messageId) {
    revalidatePath(`/admin/contact-messages/${messageId}`);
  }
}

function mapDatabaseError(
  context: string,
  error: unknown
): ContactMessageActionResult {
  console.error(`[contact-messages] ${context}`, error);

  return {
    success: false,
    error: CONTACT_MESSAGE_ERRORS.generic,
  };
}

export async function updateContactMessageStatusAction(input: {
  id: string;
  status: "new" | "in_progress" | "handled";
}): Promise<ContactMessageActionResult> {
  const parsed = updateContactMessageStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: CONTACT_MESSAGE_ERRORS.generic,
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: CONTACT_MESSAGE_ERRORS.unauthorized };
  }

  const existing = await fetchContactMessageById(parsed.data.id);

  if (!existing) {
    return { success: false, error: CONTACT_MESSAGE_ERRORS.notFound };
  }

  const { supabase } = adminContext;
  const { error } = await supabase
    .from("contact_messages")
    .update({ is_read: statusToIsRead(parsed.data.status) })
    .eq("id", parsed.data.id);

  if (error) {
    return mapDatabaseError("updateContactMessageStatusAction update failed", error);
  }

  revalidateContactMessagePaths(parsed.data.id);

  return {
    success: true,
    data: {
      id: parsed.data.id,
      status: parsed.data.status,
    },
  };
}

export async function deleteContactMessageAction(input: {
  id: string;
}): Promise<ContactMessageActionResult> {
  const parsed = deleteContactMessageSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: CONTACT_MESSAGE_ERRORS.generic,
    };
  }

  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: CONTACT_MESSAGE_ERRORS.unauthorized };
  }

  const existing = await fetchContactMessageById(parsed.data.id);

  if (!existing) {
    return { success: false, error: CONTACT_MESSAGE_ERRORS.notFound };
  }

  const { supabase } = adminContext;
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", existing.id);

  if (error) {
    return mapDatabaseError("deleteContactMessageAction delete failed", error);
  }

  revalidateContactMessagePaths(existing.id);

  return { success: true };
}
