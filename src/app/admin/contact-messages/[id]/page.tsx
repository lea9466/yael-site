import { notFound } from "next/navigation";

import { buildAdminBreadcrumbs } from "@/lib/admin/breadcrumbs";
import { ContactMessageDetailClient } from "@/components/contact-messages/contact-message-detail-client";
import { fetchContactMessageById } from "@/lib/contact-messages/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type ContactMessageDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactMessageDetailPage({
  params,
}: ContactMessageDetailPageProps) {
  await requireAdmin();

  const { id } = await params;
  const message = await fetchContactMessageById(id);

  if (!message) {
    notFound();
  }

  const breadcrumbItems = buildAdminBreadcrumbs(
    `/admin/contact-messages/${message.id}`
  );

  return (
    <ContactMessageDetailClient
      key={message.id}
      message={message}
      breadcrumbItems={breadcrumbItems}
    />
  );
}
