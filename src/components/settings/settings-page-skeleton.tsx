export function SettingsPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] animate-pulse space-y-8">
      <div className="space-y-4">
        <div className="h-4 w-40 rounded bg-[var(--color-surface-soft)]" />
        <div className="h-12 w-72 max-w-full rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]" />
        <div className="h-5 w-96 max-w-full rounded bg-[var(--color-surface-soft)]" />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row-reverse">
        <div className="flex gap-2 lg:hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-24 shrink-0 rounded-[var(--radius-full)] bg-[var(--color-surface-soft)]"
            />
          ))}
        </div>
        <div className="hidden w-56 space-y-2 lg:block">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-11 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)]"
            />
          ))}
        </div>
        <div className="min-h-[420px] flex-1 rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]" />
      </div>
    </div>
  );
}
