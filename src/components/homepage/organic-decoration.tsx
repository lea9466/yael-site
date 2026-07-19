import { cn } from "@/lib/utils/cn";

type OrganicDecorationProps = {
  variant?: "hero" | "section" | "coral" | "mint";
  className?: string;
};

const variantClasses: Record<
  NonNullable<OrganicDecorationProps["variant"]>,
  string
> = {
  hero: "bg-[var(--color-light-sage-soft)]",
  section: "bg-[var(--color-warm-gold-soft)]",
  coral: "bg-[var(--color-coral-soft)]",
  mint: "bg-[var(--color-fresh-green-soft)]",
};

export function OrganicDecoration({
  variant = "section",
  className,
}: OrganicDecorationProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-3xl opacity-70 motion-safe:animate-[admin-blob-float_12s_ease-in-out_infinite]",
        variantClasses[variant],
        className
      )}
    />
  );
}

export function OrganicDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "mx-auto h-1 w-24 rounded-full bg-[image:var(--gradient-warm)] opacity-80",
        className
      )}
    />
  );
}
