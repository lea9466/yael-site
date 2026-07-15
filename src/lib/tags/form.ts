import type { TagType } from "@/lib/tags/constants";
import type { TagInput } from "@/lib/validations/tag";

export function createEmptyTagFormInput(type: TagType = "recipe"): TagInput {
  return {
    name: "",
    slug: "",
    type,
  };
}

export function tagToFormInput(tag: {
  name: string;
  slug: string;
  type: TagType;
}): TagInput {
  return {
    name: tag.name,
    slug: tag.slug,
    type: tag.type,
  };
}
