export default function AdminPressLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <div className="h-24 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]" />
        <div className="h-28 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]" />
        <div className="h-28 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]" />
      </div>
      <div className="h-64 animate-pulse rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]" />
    </div>
  );
}
