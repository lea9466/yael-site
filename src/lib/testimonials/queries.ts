import { createClient } from "@/lib/auth/session";
import { TESTIMONIALS_PAGE_SIZE } from "@/lib/testimonials/constants";
import type {
  ServiceOption,
  ServiceTestimonialItem,
  TestimonialDetail,
  TestimonialListItem,
  TestimonialRecord,
  TestimonialSearchResult,
  TestimonialsListData,
} from "@/lib/testimonials/types";
import type {
  ListTestimonialsQuery,
  TestimonialSortValue,
} from "@/lib/validations/testimonial";

type SortConfig = {
  column: "created_at" | "name" | "updated_at";
  ascending: boolean;
};

const SORT_CONFIG: Record<TestimonialSortValue, SortConfig> = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  name: { column: "name", ascending: true },
};

const TESTIMONIAL_COLUMNS =
  "id, name, city, content, service_id, featured, is_published, created_at, updated_at";

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

async function fetchServiceTitles(
  serviceIds: string[]
): Promise<Map<string, string>> {
  const titles = new Map<string, string>();

  if (serviceIds.length === 0) {
    return titles;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, title")
    .in("id", serviceIds);

  if (!error && data) {
    for (const row of data) {
      titles.set(row.id, row.title);
    }
  }

  return titles;
}

function toTestimonialListItem(
  record: TestimonialRecord,
  serviceTitles: Map<string, string>
): TestimonialListItem {
  return {
    ...record,
    serviceTitle: record.service_id
      ? serviceTitles.get(record.service_id) ?? null
      : null,
  };
}

export async function fetchTestimonialsList(
  query: ListTestimonialsQuery
): Promise<TestimonialsListData | null> {
  try {
    const supabase = await createClient();
    const sort = SORT_CONFIG[query.sort];
    const from = (query.page - 1) * TESTIMONIALS_PAGE_SIZE;
    const to = from + TESTIMONIALS_PAGE_SIZE - 1;

    let listQuery = supabase
      .from("testimonials")
      .select(TESTIMONIAL_COLUMNS, { count: "exact" });

    if (query.status === "published") {
      listQuery = listQuery.eq("is_published", true);
    } else if (query.status === "draft") {
      listQuery = listQuery.eq("is_published", false);
    }

    if (query.q.length > 0) {
      const pattern = `%${escapeIlikePattern(query.q)}%`;
      listQuery = listQuery.ilike("name", pattern);
    }

    const { data, error, count } = await listQuery
      .order(sort.column, { ascending: sort.ascending })
      .range(from, to);

    if (error) {
      return null;
    }

    const records = (data ?? []) as TestimonialRecord[];
    const serviceIds = records
      .map((record) => record.service_id)
      .filter((id): id is string => id !== null);
    const serviceTitles = await fetchServiceTitles(serviceIds);
    const totalCount = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / TESTIMONIALS_PAGE_SIZE));

    return {
      items: records.map((record) =>
        toTestimonialListItem(record, serviceTitles)
      ),
      query,
      pagination: {
        page: query.page,
        totalPages,
        totalCount,
      },
    };
  } catch {
    return null;
  }
}

export async function fetchTestimonialById(
  id: string
): Promise<TestimonialDetail | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select(TESTIMONIAL_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const record = data as TestimonialRecord;
    const serviceTitles = record.service_id
      ? await fetchServiceTitles([record.service_id])
      : new Map<string, string>();

    return {
      ...record,
      serviceTitle: record.service_id
        ? serviceTitles.get(record.service_id) ?? null
        : null,
    };
  } catch {
    return null;
  }
}

export async function fetchPublishedServiceOptions(): Promise<ServiceOption[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("id, title")
      .eq("status", "published")
      .order("title", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data as ServiceOption[];
  } catch {
    return [];
  }
}

export async function fetchAdminServiceOptions(): Promise<ServiceOption[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("id, title")
      .neq("status", "archived")
      .order("title", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data as ServiceOption[];
  } catch {
    return [];
  }
}

export async function fetchTestimonialsByServiceId(
  serviceId: string
): Promise<ServiceTestimonialItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select(TESTIMONIAL_COLUMNS)
      .eq("service_id", serviceId)
      .order("updated_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    const records = data as TestimonialRecord[];
    const serviceTitles = await fetchServiceTitles([serviceId]);

    return records.map((record) =>
      toTestimonialListItem(record, serviceTitles)
    );
  } catch {
    return [];
  }
}

export async function searchTestimonials(
  query: string,
  options?: { limit?: number }
): Promise<TestimonialSearchResult[]> {
  try {
    const supabase = await createClient();
    const limit = options?.limit ?? 20;

    let searchQuery = supabase
      .from("testimonials")
      .select(TESTIMONIAL_COLUMNS)
      .order("name", { ascending: true })
      .limit(limit);

    if (query.length > 0) {
      const pattern = `%${escapeIlikePattern(query)}%`;
      searchQuery = searchQuery.ilike("name", pattern);
    }

    const { data, error } = await searchQuery;

    if (error || !data) {
      return [];
    }

    const records = data as TestimonialRecord[];
    const serviceIds = records
      .map((record) => record.service_id)
      .filter((id): id is string => id !== null);
    const serviceTitles = await fetchServiceTitles(serviceIds);

    return records.map((record) =>
      toTestimonialListItem(record, serviceTitles)
    );
  } catch {
    return [];
  }
}

export async function verifyServiceExists(
  serviceId: string | null
): Promise<boolean> {
  if (!serviceId) {
    return true;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("id")
    .eq("id", serviceId)
    .maybeSingle();

  return !error && Boolean(data);
}
