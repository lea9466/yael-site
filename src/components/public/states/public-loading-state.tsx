import { Container } from "@/components/public/layout/container";
import { cn } from "@/lib/utils/cn";

type PublicLoadingStateProps = {
  label?: string;
  className?: string;
};

export function PublicLoadingState({
  label = "טוען…",
  className,
}: PublicLoadingStateProps) {
  return (
    <Container
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-4 py-20",
        className
      )}
    >
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="flex flex-col items-center gap-4"
      >
        <span
          aria-hidden="true"
          className="size-10 animate-spin rounded-[var(--radius-full)] border-2 border-[var(--color-border)] border-t-[var(--color-primary)]"
        />
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      </div>
    </Container>
  );
}
