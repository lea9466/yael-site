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

export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} דק׳`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (remainder === 0) {
    return `${hours} שע׳`;
  }

  return `${hours} שע׳ ו-${remainder} דק׳`;
}

export function formatDifficulty(difficulty: RecipeDifficulty): string {
  return DIFFICULTY_LABELS[difficulty];
}
