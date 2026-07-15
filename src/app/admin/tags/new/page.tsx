import { TagForm } from "@/components/tags/tag-form";
import { createEmptyTagFormInput } from "@/lib/tags/form";
import { requireAdmin } from "@/lib/auth/session";
import { TAG_TYPES } from "@/lib/tags/constants";
import type { TagType } from "@/lib/tags/constants";

export const dynamic = "force-dynamic";

type NewTagPageProps = {
  searchParams: Promise<{ type?: string }>;
};

function parseDefaultType(value?: string): TagType {
  if (value && (TAG_TYPES as readonly string[]).includes(value)) {
    return value as TagType;
  }

  return "recipe";
}

export default async function NewTagPage({ searchParams }: NewTagPageProps) {
  await requireAdmin();

  const { type } = await searchParams;

  return (
    <TagForm
      mode="create"
      initialValues={createEmptyTagFormInput(parseDefaultType(type))}
    />
  );
}
