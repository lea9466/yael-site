import { PressForm } from "@/components/press/press-form";
import { requireAdmin } from "@/lib/auth/session";
import { createEmptyPressFormValues } from "@/lib/press/form";

export const dynamic = "force-dynamic";

export default async function AdminPressNewPage() {
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-5xl pb-28">
      <PressForm mode="create" initialValues={createEmptyPressFormValues()} />
    </div>
  );
}
