import { notFound } from "next/navigation";

import { PressForm } from "@/components/press/press-form";
import { requireAdmin } from "@/lib/auth/session";
import { pressArticleToFormValues } from "@/lib/press/form";
import { fetchPressArticleById } from "@/lib/press/queries";

export const dynamic = "force-dynamic";

type AdminPressEditPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPressEditPage({
  params,
}: AdminPressEditPageProps) {
  await requireAdmin();

  const { id } = await params;
  const article = await fetchPressArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl pb-28">
      <PressForm
        mode="edit"
        article={article}
        initialValues={pressArticleToFormValues(article)}
      />
    </div>
  );
}
