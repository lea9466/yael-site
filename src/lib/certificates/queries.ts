import { createClient } from "@/lib/auth/session";
import { CERTIFICATES_SITE_CONTENT_KEY } from "@/lib/certificates/constants";
import { sortCertificatesByOrder } from "@/lib/certificates/order";
import type {
  CertificateListItem,
  CertificateMediaPreview,
  CertificatesPageData,
} from "@/lib/certificates/types";
import { getPublicMediaUrl } from "@/lib/media/public-url";
import {
  certificatesDataSchema,
  type CertificateItem,
  type CertificatesData,
} from "@/lib/validations/certificate";

type SiteContentRow = {
  data: unknown;
  updated_at: string;
};

const MEDIA_SELECT_COLUMNS =
  "id, storage_path, file_name, original_file_name, alt_text";

export type CertificatesContentSnapshot = {
  data: CertificatesData;
  updatedAt: string;
};

export async function fetchCertificatesContentSnapshot(): Promise<CertificatesContentSnapshot | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("data, updated_at")
      .eq("key", CERTIFICATES_SITE_CONTENT_KEY)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const row = data as SiteContentRow;
    const parsed = certificatesDataSchema.safeParse(row.data);

    if (!parsed.success) {
      return null;
    }

    return {
      data: parsed.data,
      updatedAt: row.updated_at,
    };
  } catch {
    return null;
  }
}

async function fetchMediaPreviewsByIds(
  mediaIds: string[]
): Promise<Map<string, CertificateMediaPreview>> {
  if (mediaIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const uniqueIds = [...new Set(mediaIds)];
  const { data, error } = await supabase
    .from("media_library")
    .select(MEDIA_SELECT_COLUMNS)
    .in("id", uniqueIds);

  if (error || !data) {
    return new Map();
  }

  const previews = new Map<string, CertificateMediaPreview>();

  for (const row of data) {
    const url = getPublicMediaUrl(row.storage_path);

    previews.set(row.id, {
      id: row.id,
      url: url ?? "",
      alt: row.alt_text ?? row.original_file_name ?? row.file_name,
    });
  }

  return previews;
}

function toCertificateListItem(
  item: CertificateItem,
  mediaPreview: CertificateMediaPreview | null
): CertificateListItem {
  return {
    ...item,
    mediaPreview,
  };
}

export async function fetchCertificatesPageData(): Promise<CertificatesPageData | null> {
  const snapshot = await fetchCertificatesContentSnapshot();

  if (!snapshot) {
    return null;
  }

  const sortedItems = sortCertificatesByOrder(snapshot.data.items);
  const mediaIds = sortedItems.map((item) => item.media_id);
  const previews = await fetchMediaPreviewsByIds(mediaIds);

  return {
    updatedAt: snapshot.updatedAt,
    items: sortedItems.map((item) =>
      toCertificateListItem(item, previews.get(item.media_id) ?? null)
    ),
  };
}

export async function fetchCertificateById(
  id: string
): Promise<{ item: CertificateListItem; updatedAt: string } | null> {
  const pageData = await fetchCertificatesPageData();

  if (!pageData) {
    return null;
  }

  const item = pageData.items.find((entry) => entry.id === id);

  if (!item) {
    return null;
  }

  return {
    item,
    updatedAt: pageData.updatedAt,
  };
}
