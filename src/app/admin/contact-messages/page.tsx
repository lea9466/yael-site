import { ContactMessagesListClient } from "@/components/contact-messages/contact-messages-list-client";
import { ContactMessagesPageError } from "@/components/contact-messages/contact-messages-page-error";
import { fetchContactMessagesList } from "@/lib/contact-messages/queries";
import { requireAdmin } from "@/lib/auth/session";
import { listContactMessagesQuerySchema } from "@/lib/validations/contact-message";

export const dynamic = "force-dynamic";

type ContactMessagesPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ContactMessagesPage({
  searchParams,
}: ContactMessagesPageProps) {
  await requireAdmin();

  const rawParams = await searchParams;
  const parsedQuery = listContactMessagesQuerySchema.safeParse(rawParams);
  const query = parsedQuery.success
    ? parsedQuery.data
    : listContactMessagesQuerySchema.parse({});

  const data = await fetchContactMessagesList(query);

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <ContactMessagesPageError />
      </div>
    );
  }

  return (
    <ContactMessagesListClient
      key={`${data.query.q}-${data.query.status}-${data.query.sort}-${data.query.page}`}
      data={data}
    />
  );
}
