import { ServiceForm } from "@/components/services/service-form";
import { createEmptyServiceFormInput } from "@/lib/services/form";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  await requireAdmin();

  return <ServiceForm mode="create" initialValues={createEmptyServiceFormInput()} />;
}
