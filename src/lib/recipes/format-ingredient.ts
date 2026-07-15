import type { RecipeIngredient } from "@/lib/recipes/types";

export function formatIngredientLine(ingredient: RecipeIngredient): string {
  const name = ingredient.name.trim();
  const quantity = ingredient.quantity.trim();
  const unit = ingredient.unit.trim();

  const prefix = [quantity, unit].filter(Boolean).join(" ");

  if (prefix && name) {
    return `${prefix} ${name}`.trim();
  }

  return name || prefix;
}
