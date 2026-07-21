import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CertificatesPublicView } from "@/components/certificates/public/certificates-public-view";
import { fetchCertificatesPageData } from "@/lib/certificates/queries";
import { getWebsiteSettings } from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();

  return buildSiteMetadata(settings, {
    path: "/certificates",
    title: "תעודות והסמכות",
    description:
      "הכשרות, לימודים והסמכות מקצועיות — הבסיס לליווי תזונתי מקצועי ואמין.",
  });
}

export default async function PublicCertificatesPage() {
  const pageData = await fetchCertificatesPageData();

  if (!pageData) {
    notFound();
  }

  return <CertificatesPublicView items={pageData.items} />;
}
