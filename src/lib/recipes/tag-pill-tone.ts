export const RECIPE_TAG_PILL_TONES = [
  "sage",
  "beige",
  "coral",
  "dusty-pink",
  "cream",
  "olive",
] as const;

export type RecipeTagPillTone = (typeof RECIPE_TAG_PILL_TONES)[number];

export function getRecipeTagPillTone(index: number): RecipeTagPillTone {
  return RECIPE_TAG_PILL_TONES[index % RECIPE_TAG_PILL_TONES.length];
}
