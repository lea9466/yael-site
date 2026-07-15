// Deterministic, purely presentational accent for tag pills.
// Never persisted — derived at render time from a stable seed (tag id,
// or the draft name while a tag is still being created).

export type TagAccent = {
  solid: string;
  soft: string;
};

const TAG_ACCENT_PALETTE: TagAccent[] = [
  { solid: "var(--color-warm-gold)", soft: "var(--color-warm-gold-soft)" },
  { solid: "var(--color-soft-accent)", soft: "var(--color-coral-soft)" },
  { solid: "var(--color-light-sage)", soft: "var(--color-light-sage-soft)" },
  { solid: "var(--color-secondary)", soft: "var(--color-cream)" },
  { solid: "var(--color-accent)", soft: "var(--color-cream)" },
];

function hashSeed(seed: string): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getTagAccent(seed: string): TagAccent {
  const trimmed = seed.trim();

  if (trimmed.length === 0) {
    return TAG_ACCENT_PALETTE[0];
  }

  const index = hashSeed(trimmed) % TAG_ACCENT_PALETTE.length;

  return TAG_ACCENT_PALETTE[index];
}
