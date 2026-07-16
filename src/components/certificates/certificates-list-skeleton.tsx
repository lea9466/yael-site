export function CertificatesListSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-10">
      <div className="space-y-4">
        <div className="h-4 w-48 animate-pulse rounded bg-[var(--color-surface-soft)]" />
        <div className="h-24 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]" />
      </div>
      <div className="h-10 w-40 animate-pulse rounded bg-[var(--color-surface-soft)]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]"
          />
        ))}
      </div>
    </div>
  );
}
