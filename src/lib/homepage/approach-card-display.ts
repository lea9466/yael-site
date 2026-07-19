export type ApproachCardSurface = "sage" | "coral" | "cream" | "sky";

export const APPROACH_CARD_SURFACES: ApproachCardSurface[] = [
  "sage",
  "coral",
  "cream",
  "sky",
];

export function getApproachCardSurface(index: number): ApproachCardSurface {
  return APPROACH_CARD_SURFACES[index % APPROACH_CARD_SURFACES.length] ?? "sage";
}

export function getApproachDesktopColumns(count: number): number {
  return Math.min(4, Math.max(1, count));
}
