import { CertificatesListClient } from "@/components/certificates/certificates-list-client";
import { CertificatesPageError } from "@/components/certificates/certificates-page-error";
import { fetchCertificatesPageData } from "@/lib/certificates/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  await requireAdmin();

  const data = await fetchCertificatesPageData();

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-[1400px]">
        <CertificatesPageError />
      </div>
    );
  }

  return (
    <CertificatesListClient
      key={data.updatedAt}
      data={data}
    />
  );
}
