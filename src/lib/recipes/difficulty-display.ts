import type { RecipeDifficulty } from "@/lib/recipes/constants";
import { DIFFICULTY_LABELS } from "@/lib/recipes/constants";

export type DifficultyDisplay = {
  label: string;
  background: string;
  color: string;
};

const DIFFICULTY_DISPLAY: Record<RecipeDifficulty, DifficultyDisplay> = {
  easy: {
    label: DIFFICULTY_LABELS.easy,
    background: "#EAF3E9",
    color: "#3F5F47",
  },
  medium: {
    label: DIFFICULTY_LABELS.medium,
    background: "#F5E8D5",
    color: "#7A5A31",
  },
  hard: {
    label: DIFFICULTY_LABELS.hard,
    background: "#F7DEDA",
    color: "#8E4941",
  },
};

export function getDifficultyDisplay(
  difficulty: RecipeDifficulty
): DifficultyDisplay {
  return DIFFICULTY_DISPLAY[difficulty];
}
