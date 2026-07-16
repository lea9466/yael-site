import { notFound } from "next/navigation";

import { PreviewShell } from "@/components/admin/preview-shell";
import { AboutPublicView } from "@/components/about/about-public-view";
import { fetchAboutPageDetail } from "@/lib/about/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AboutPreviewPage() {
  await requireAdmin();

  const detail = await fetchAboutPageDetail();

  if (!detail) {
    notFound();
  }

  return (
    <PreviewShell status="published" editHref="/admin/about">
      <AboutPublicView
        data={detail.data}
        coverPreview={detail.coverPreview}
        blockMediaUrls={detail.blockMediaUrls}
        mode="preview"
      />
    </PreviewShell>
  );
}
