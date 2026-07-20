import type { RecipeIngredient } from "@/lib/recipes/types";

function asTrimmedText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function formatIngredientLine(ingredient: RecipeIngredient): string {
  const name = asTrimmedText(ingredient.name);
  const quantity = asTrimmedText(ingredient.quantity);
  const unit = asTrimmedText(ingredient.unit);

  const prefix = [quantity, unit].filter(Boolean).join(" ");

  if (prefix && name) {
    return `${prefix} ${name}`.trim();
  }

  return name || prefix;
}
