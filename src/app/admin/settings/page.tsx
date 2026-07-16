import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { SettingsPageError } from "@/components/settings/settings-page-error";
import { requireAdmin } from "@/lib/auth/session";
import { fetchSettingsPageData } from "@/lib/settings/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();

  const data = await fetchSettingsPageData();

  if (!data) {
    return <SettingsPageError />;
  }

  return (
    <SettingsPageClient
      key={`${data.businessProfileUpdatedAt}-${data.siteSettingsUpdatedAt}-${data.homepageUpdatedAt}`}
      data={data}
    />
  );
}
