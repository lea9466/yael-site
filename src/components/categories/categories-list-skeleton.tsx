export function CategoriesListSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-[var(--color-surface-soft)]" />
        <div className="h-4 w-64 animate-pulse rounded bg-[var(--color-surface-soft)]" />
      </div>
      <div className="h-36 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]"
          />
        ))}
      </div>
    </div>
  );
}
