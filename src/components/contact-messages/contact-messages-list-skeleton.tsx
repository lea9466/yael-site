import { AdminListShell } from "@/components/admin/admin-list-shell";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] ${className ?? ""}`}
    />
  );
}

export function ContactMessagesListSkeleton() {
  return (
    <AdminListShell>
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-48" />
        <SkeletonBlock className="h-5 w-80 max-w-full" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SkeletonBlock className="h-11 lg:col-span-2" />
        <SkeletonBlock className="h-11" />
        <SkeletonBlock className="h-11" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-56 rounded-[var(--radius-lg)]" />
        ))}
      </div>
    </AdminListShell>
  );
}
