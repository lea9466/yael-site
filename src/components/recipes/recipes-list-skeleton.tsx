import { Card } from "@/components/ui/card";

export function RecipesListSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-40 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-soft)]" />
        <div className="h-5 w-72 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-soft)]" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)]"
          />
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-36 animate-pulse bg-[var(--color-surface-soft)]">
            <span className="sr-only">טוען</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
