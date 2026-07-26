import { notFound } from "next/navigation";

import { PreviewShell } from "@/components/admin/preview-shell";
import { AboutPublicView } from "@/components/about/about-public-view";
import { fetchAboutPageDetail } from "@/lib/about/queries";
import { requireAdmin } from "@/lib/auth/session";
import { fetchCertificatesPageData } from "@/lib/certificates/queries";

export const dynamic = "force-dynamic";

export default async function AboutPreviewPage() {
  await requireAdmin();

  const [detail, certificatesData] = await Promise.all([
    fetchAboutPageDetail(),
    fetchCertificatesPageData(),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <PreviewShell status="published" editHref="/admin/about">
      <AboutPublicView
        data={detail.data}
        coverPreview={detail.coverPreview}
        blockMediaUrls={detail.blockMediaUrls}
        certificates={certificatesData?.items ?? []}
        mode="preview"
      />
    </PreviewShell>
  );
}
