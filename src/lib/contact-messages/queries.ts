import { createClient } from "@/lib/auth/session";
import { CONTACT_MESSAGES_PAGE_SIZE } from "@/lib/contact-messages/constants";
import { isReadToStatus } from "@/lib/contact-messages/status";
import type {
  ContactMessageDetail,
  ContactMessageListItem,
  ContactMessageRecord,
  ContactMessagesListData,
} from "@/lib/contact-messages/types";
import type {
  ContactMessageSortValue,
  ListContactMessagesQuery,
} from "@/lib/validations/contact-message";

type SortConfig = {
  column: "created_at";
  ascending: boolean;
};

const SORT_CONFIG: Record<ContactMessageSortValue, SortConfig> = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
};

const CONTACT_MESSAGE_COLUMNS =
  "id, full_name, email, phone, message, privacy_policy_accepted, is_read, created_at";

function escapeIlikePattern(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function toContactMessageListItem(
  record: ContactMessageRecord
): ContactMessageListItem {
  return {
    ...record,
    status: isReadToStatus(record.is_read),
  };
}

export async function fetchContactMessagesList(
  query: ListContactMessagesQuery
): Promise<ContactMessagesListData | null> {
  try {
    const supabase = await createClient();
    const sort = SORT_CONFIG[query.sort];
    const deferStatusFilter =
      query.status === "new" || query.status === "in_progress";

    let listQuery = supabase
      .from("contact_messages")
      .select(CONTACT_MESSAGE_COLUMNS, { count: "exact" });

    if (query.status === "handled") {
      listQuery = listQuery.eq("is_read", true);
    } else if (deferStatusFilter) {
      listQuery = listQuery.eq("is_read", false);
    }

    if (query.q.length > 0) {
      const pattern = `%${escapeIlikePattern(query.q)}%`;
      listQuery = listQuery.or(
        [
          `full_name.ilike.${pattern}`,
          `email.ilike.${pattern}`,
          `phone.ilike.${pattern}`,
          `message.ilike.${pattern}`,
        ].join(",")
      );
    }

    if (deferStatusFilter) {
      const { data, error } = await listQuery.order(sort.column, {
        ascending: sort.ascending,
      });

      if (error) {
        return null;
      }

      const records = (data ?? []) as ContactMessageRecord[];

      return {
        items: records.map(toContactMessageListItem),
        query,
        pagination: {
          page: query.page,
          totalPages: 1,
          totalCount: records.length,
        },
      };
    }

    const from = (query.page - 1) * CONTACT_MESSAGES_PAGE_SIZE;
    const to = from + CONTACT_MESSAGES_PAGE_SIZE - 1;

    const { data, error, count } = await listQuery
      .order(sort.column, { ascending: sort.ascending })
      .range(from, to);

    if (error) {
      return null;
    }

    const records = (data ?? []) as ContactMessageRecord[];
    const totalCount = count ?? 0;
    const totalPages = Math.max(
      1,
      Math.ceil(totalCount / CONTACT_MESSAGES_PAGE_SIZE)
    );

    return {
      items: records.map(toContactMessageListItem),
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

export async function fetchContactMessageById(
  id: string
): Promise<ContactMessageDetail | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select(CONTACT_MESSAGE_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const record = data as ContactMessageRecord;

    return {
      ...record,
      status: isReadToStatus(record.is_read),
    };
  } catch {
    return null;
  }
}
