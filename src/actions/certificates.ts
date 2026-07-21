"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient, getAuthenticatedAdmin } from "@/lib/auth/session";
import { CERTIFICATES_SITE_CONTENT_KEY } from "@/lib/certificates/constants";
import { CERTIFICATE_ERRORS } from "@/lib/certificates/errors";
import { buildDuplicateCertificateTitle } from "@/lib/certificates/format";
import {
  normalizeCertificateOrders,
  reorderCertificateItems,
} from "@/lib/certificates/order";
import { fetchCertificatesContentSnapshot } from "@/lib/certificates/queries";
import type { CertificateActionResult } from "@/lib/certificates/types";
import { verifyMediaExists } from "@/lib/services/queries";
import {
  addCertificateSchema,
  certificatesDataSchema,
  deleteCertificateSchema,
  duplicateCertificateSchema,
  formInputToCertificateFields,
  mapZodErrors,
  reorderCertificatesSchema,
  updateCertificateSchema,
  type CertificateItem,
  type CertificatesData,
} from "@/lib/validations/certificate";

function createCertificateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `certificate-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function getAdminSupabase(): Promise<{ supabase: SupabaseClient } | null> {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return null;
  }

  const supabase = await createClient();

  return { supabase };
}

function revalidateCertificatePaths() {
  revalidatePath("/admin/certificates");
  revalidatePath("/certificates");
  revalidatePath("/");
}

function mapDatabaseError(): CertificateActionResult {
  return {
    success: false,
    error: CERTIFICATE_ERRORS.generic,
  };
}

async function validateMediaReference(
  mediaId: string
): Promise<CertificateActionResult | null> {
  const exists = await verifyMediaExists(mediaId);

  if (!exists) {
    return {
      success: false,
      error: CERTIFICATE_ERRORS.invalidMedia,
      fieldErrors: { media_id: CERTIFICATE_ERRORS.invalidMedia },
    };
  }

  return null;
}

async function persistCertificatesData(
  supabase: SupabaseClient,
  nextData: CertificatesData,
  expectedUpdatedAt: string
): Promise<CertificateActionResult & { updatedAt?: string }> {
  const parsed = certificatesDataSchema.safeParse(nextData);

  if (!parsed.success) {
    return {
      success: false,
      error: CERTIFICATE_ERRORS.invalidData,
    };
  }

  const { data, error } = await supabase
    .from("site_content")
    .update({ data: parsed.data })
    .eq("key", CERTIFICATES_SITE_CONTENT_KEY)
    .eq("updated_at", expectedUpdatedAt)
    .select("updated_at")
    .maybeSingle();

  if (error) {
    return mapDatabaseError();
  }

  if (!data) {
    return {
      success: false,
      error: CERTIFICATE_ERRORS.conflict,
    };
  }

  return {
    success: true,
    updatedAt: data.updated_at,
  };
}

async function loadCertificatesForMutation(): Promise<
  | {
      supabase: SupabaseClient;
      data: CertificatesData;
      updatedAt: string;
    }
  | CertificateActionResult
> {
  const adminContext = await getAdminSupabase();

  if (!adminContext) {
    return { success: false, error: CERTIFICATE_ERRORS.unauthorized };
  }

  const snapshot = await fetchCertificatesContentSnapshot();

  if (!snapshot) {
    return mapDatabaseError();
  }

  return {
    supabase: adminContext.supabase,
    data: snapshot.data,
    updatedAt: snapshot.updatedAt,
  };
}

function findCertificateIndex(items: CertificateItem[], id: string): number {
  return items.findIndex((item) => item.id === id);
}

export async function addCertificateAction(
  input: unknown
): Promise<CertificateActionResult> {
  const parsed = addCertificateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const loaded = await loadCertificatesForMutation();

  if ("success" in loaded) {
    return loaded;
  }

  const mediaError = await validateMediaReference(parsed.data.media_id);

  if (mediaError) {
    return mediaError;
  }

  const fields = formInputToCertificateFields(parsed.data);
  const normalizedItems = normalizeCertificateOrders(loaded.data.items);
  const nextItem: CertificateItem = {
    id: createCertificateId(),
    ...fields,
    order: normalizedItems.length,
  };

  const persistResult = await persistCertificatesData(
    loaded.supabase,
    { items: [...normalizedItems, nextItem] },
    parsed.data.updatedAt
  );

  if (!persistResult.success) {
    return persistResult;
  }

  revalidateCertificatePaths();

  return {
    success: true,
    data: {
      id: nextItem.id,
      updatedAt: persistResult.updatedAt ?? parsed.data.updatedAt,
    },
  };
}

export async function updateCertificateAction(
  input: unknown
): Promise<CertificateActionResult> {
  const parsed = updateCertificateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const loaded = await loadCertificatesForMutation();

  if ("success" in loaded) {
    return loaded;
  }

  const mediaError = await validateMediaReference(parsed.data.media_id);

  if (mediaError) {
    return mediaError;
  }

  const normalizedItems = normalizeCertificateOrders(loaded.data.items);
  const itemIndex = findCertificateIndex(normalizedItems, parsed.data.id);

  if (itemIndex < 0) {
    return { success: false, error: CERTIFICATE_ERRORS.notFound };
  }

  const fields = formInputToCertificateFields(parsed.data);
  const nextItems = normalizedItems.map((item) =>
    item.id === parsed.data.id
      ? {
          ...item,
          ...fields,
        }
      : item
  );

  const persistResult = await persistCertificatesData(
    loaded.supabase,
    { items: nextItems },
    parsed.data.updatedAt
  );

  if (!persistResult.success) {
    return persistResult;
  }

  revalidateCertificatePaths();

  return {
    success: true,
    data: {
      id: parsed.data.id,
      updatedAt: persistResult.updatedAt ?? parsed.data.updatedAt,
    },
  };
}

export async function duplicateCertificateAction(
  input: unknown
): Promise<CertificateActionResult> {
  const parsed = duplicateCertificateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const loaded = await loadCertificatesForMutation();

  if ("success" in loaded) {
    return loaded;
  }

  const normalizedItems = normalizeCertificateOrders(loaded.data.items);
  const sourceIndex = findCertificateIndex(normalizedItems, parsed.data.id);

  if (sourceIndex < 0) {
    return { success: false, error: CERTIFICATE_ERRORS.notFound };
  }

  const source = normalizedItems[sourceIndex];
  const duplicate: CertificateItem = {
    ...source,
    id: createCertificateId(),
    title: buildDuplicateCertificateTitle(source.title),
    order: source.order + 1,
  };

  const nextItems = [...normalizedItems];
  nextItems.splice(sourceIndex + 1, 0, duplicate);

  const persistResult = await persistCertificatesData(
    loaded.supabase,
    { items: normalizeCertificateOrders(nextItems) },
    parsed.data.updatedAt
  );

  if (!persistResult.success) {
    return persistResult;
  }

  revalidateCertificatePaths();

  return {
    success: true,
    data: {
      id: duplicate.id,
      updatedAt: persistResult.updatedAt ?? parsed.data.updatedAt,
    },
  };
}

export async function reorderCertificatesAction(
  input: unknown
): Promise<CertificateActionResult> {
  const parsed = reorderCertificatesSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const loaded = await loadCertificatesForMutation();

  if ("success" in loaded) {
    return loaded;
  }

  const normalizedItems = normalizeCertificateOrders(loaded.data.items);
  const reordered = reorderCertificateItems(
    normalizedItems,
    parsed.data.orderedIds
  );

  if (!reordered) {
    return {
      success: false,
      error: CERTIFICATE_ERRORS.invalidData,
    };
  }

  const persistResult = await persistCertificatesData(
    loaded.supabase,
    { items: reordered },
    parsed.data.updatedAt
  );

  if (!persistResult.success) {
    return persistResult;
  }

  revalidateCertificatePaths();

  return {
    success: true,
    data: {
      id: parsed.data.orderedIds[0] ?? "",
      updatedAt: persistResult.updatedAt ?? parsed.data.updatedAt,
    },
  };
}

export async function deleteCertificateAction(
  input: unknown
): Promise<CertificateActionResult> {
  const parsed = deleteCertificateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "יש לתקן את השדות המסומנים.",
      fieldErrors: mapZodErrors(parsed.error),
    };
  }

  const loaded = await loadCertificatesForMutation();

  if ("success" in loaded) {
    return loaded;
  }

  const normalizedItems = normalizeCertificateOrders(loaded.data.items);
  const nextItems = normalizedItems.filter((item) => item.id !== parsed.data.id);

  if (nextItems.length === normalizedItems.length) {
    return { success: false, error: CERTIFICATE_ERRORS.notFound };
  }

  const persistResult = await persistCertificatesData(
    loaded.supabase,
    { items: normalizeCertificateOrders(nextItems) },
    parsed.data.updatedAt
  );

  if (!persistResult.success) {
    return persistResult;
  }

  revalidateCertificatePaths();

  return {
    success: true,
    data: {
      id: parsed.data.id,
      updatedAt: persistResult.updatedAt ?? parsed.data.updatedAt,
    },
  };
}
