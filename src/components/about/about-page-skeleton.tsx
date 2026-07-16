export function AboutPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] animate-pulse space-y-8 pb-28">
      <div className="h-8 w-48 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)]" />
      <div className="h-12 w-72 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)]" />
      <div className="space-y-4">
        <div className="h-40 rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]" />
        <div className="h-64 rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]" />
        <div className="h-48 rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]" />
      </div>
    </div>
  );
}
