import { cn } from "@/lib/utils/cn";

type SectionTone = "default" | "soft" | "cream";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  tone?: SectionTone;
  id?: string;
  ariaLabelledBy?: string;
};

const toneClasses: Record<SectionTone, string> = {
  default: "bg-transparent",
  soft: "bg-[var(--color-surface-soft)]/70",
  cream: "bg-[var(--color-cream)]/60",
};

export function Section({
  children,
  className,
  tone = "default",
  id,
  ariaLabelledBy,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "py-[var(--spacing-section)] sm:py-[var(--spacing-3xl)]",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </section>
  );
}
