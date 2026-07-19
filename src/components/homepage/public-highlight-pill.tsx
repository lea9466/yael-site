import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";

import type { ShortAboutHighlightVariant } from "@/lib/homepage/short-about-highlights";
import { cn } from "@/lib/utils/cn";

type PublicHighlightPillProps = {
  label: string;
  icon?: LucideIcon;
  variant: ShortAboutHighlightVariant;
  className?: string;
  animationDuration?: string;
  style?: CSSProperties;
  floating?: boolean;
};

const variantClasses: Record<ShortAboutHighlightVariant, string> = {
  mint: "public-highlight-pill--mint",
  teal: "public-highlight-pill--teal",
  coral: "public-highlight-pill--coral",
  gold: "public-highlight-pill--gold",
};

export function PublicHighlightPill({
  label,
  icon: Icon,
  variant,
  className,
  animationDuration = "3s",
  style,
  floating = true,
}: PublicHighlightPillProps) {
  return (
    <span
      className={cn(
        "public-highlight-pill",
        floating && "motion-safe:animate-bounce hover:motion-safe:animate-none",
        variantClasses[variant],
        className
      )}
      style={{ animationDuration, ...style }}
    >
      {Icon ? <Icon aria-hidden="true" className="size-3.5 shrink-0" /> : null}
      <span>{label}</span>
    </span>
  );
}
