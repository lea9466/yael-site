import { GENERAL_TESTIMONIAL_LABEL } from "@/lib/testimonials/constants";
import { cn } from "@/lib/utils/cn";

type TestimonialServiceLabelProps = {
  serviceTitle?: string | null;
  className?: string;
  size?: "sm" | "md";
};

export function TestimonialServiceLabel({
  serviceTitle,
  className,
  size = "md",
}: TestimonialServiceLabelProps) {
  const label = serviceTitle?.trim() || GENERAL_TESTIMONIAL_LABEL;

  return (
    <span
      className={cn(
        "inline-flex max-w-full truncate rounded-[var(--radius-full)] border border-[var(--color-border)]/80 bg-[var(--color-surface-soft)] px-2.5 py-1 font-medium text-[var(--color-text-muted)]",
        size === "sm" ? "text-caption" : "text-sm",
        className
      )}
      title={label}
    >
      {label}
    </span>
  );
}
