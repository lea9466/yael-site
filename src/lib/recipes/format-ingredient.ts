import type { RecipeIngredient } from "@/lib/recipes/types";

function asTrimmedText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Converts a stored ingredient (new `{ text }` or legacy name/quantity/unit)
 * into a single display/edit line. Does not mutate database content.
 */
export function legacyIngredientToText(value: unknown): string {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return "";
  }

  const record = value as Record<string, unknown>;
  const text = asTrimmedText(record.text);

  if (text) {
    return text;
  }

  const quantity = asTrimmedText(record.quantity);
  const unit = asTrimmedText(record.unit);
  const name = asTrimmedText(record.name);

  return [quantity, unit, name].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function formatIngredientLine(
  ingredient: RecipeIngredient | Record<string, unknown>
): string {
  return legacyIngredientToText(ingredient);
}

export function toRecipeIngredient(value: unknown): RecipeIngredient | null {
  const text = legacyIngredientToText(value);

  if (!text) {
    return null;
  }

  return { text };
}
