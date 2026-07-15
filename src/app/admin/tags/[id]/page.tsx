import { notFound } from "next/navigation";

import { TagForm } from "@/components/tags/tag-form";
import { tagToFormInput } from "@/lib/tags/form";
import { fetchTagById } from "@/lib/tags/queries";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type EditTagPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTagPage({ params }: EditTagPageProps) {
  await requireAdmin();

  const { id } = await params;
  const tag = await fetchTagById(id);

  if (!tag) {
    notFound();
  }

  return (
    <TagForm
      key={tag.id}
      mode="edit"
      tag={tag}
      initialValues={tagToFormInput(tag)}
    />
  );
}
