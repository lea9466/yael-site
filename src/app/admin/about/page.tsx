import { AboutForm } from "@/components/about/about-form";
import { AboutPageError } from "@/components/about/about-page-error";
import { fetchAboutPageDetail } from "@/lib/about/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  await requireAdmin();

  const detail = await fetchAboutPageDetail();

  if (!detail) {
    return (
      <div className="mx-auto w-full max-w-[1400px]">
        <AboutPageError />
      </div>
    );
  }

  return <AboutForm key={detail.updatedAt} detail={detail} />;
}
