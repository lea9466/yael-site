import { AdminListShell } from "@/components/admin/admin-list-shell";

export default function ArticlesLoading() {
  return (
    <AdminListShell>
      <div className="space-y-6 animate-pulse">
        <div className="h-24 rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]"
            />
          ))}
        </div>
        <div className="h-40 rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)]" />
      </div>
    </AdminListShell>
  );
}
