import { Card } from "@/components/ui/card";

export function MediaGridSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="טוען ספריית מדיה"
      className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden p-0">
          <div className="aspect-[4/3] animate-pulse bg-[var(--color-surface-soft)]" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--color-surface-soft)]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-surface-soft)]" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-surface-soft)]" />
          </div>
        </Card>
      ))}
    </div>
  );
}
