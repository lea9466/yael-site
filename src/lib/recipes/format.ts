import type { RecipeDifficulty } from "@/lib/recipes/constants";
import { DIFFICULTY_LABELS } from "@/lib/recipes/constants";

export function formatRecipeDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDifficulty(difficulty: RecipeDifficulty): string {
  return DIFFICULTY_LABELS[difficulty];
}
