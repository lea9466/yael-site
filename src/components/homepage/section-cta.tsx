import Link from "next/link";

import { cn } from "@/lib/utils/cn";

type SectionCTAProps = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variantClasses: Record<
  NonNullable<SectionCTAProps["variant"]>,
  string
> = {
  primary:
    "bg-[image:var(--gradient-warm)] text-[var(--color-text-on-primary)] shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
  secondary:
    "border border-[var(--color-primary)] bg-[var(--color-surface)]/80 text-[var(--color-primary)] hover:bg-[var(--color-light-sage-soft)]",
  ghost:
    "text-[var(--color-primary)] underline-offset-4 hover:underline",
};

export function SectionCTA({
  label,
  href,
  variant = "primary",
  className,
}: SectionCTAProps) {
  return (
    <Link
      href={href}
      className={cn(
        "public-focus-ring inline-flex min-h-11 items-center justify-center rounded-[var(--radius-full)] px-5 text-sm font-medium transition-[transform,box-shadow,background-color] duration-[var(--transition-base)]",
        variantClasses[variant],
        className
      )}
    >
      {label}
    </Link>
  );
}
