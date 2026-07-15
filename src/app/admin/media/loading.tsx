import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";

export default function MediaLoadingPage() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6">
      <div className="space-y-3">
        <div className="h-8 w-48 animate-pulse rounded bg-[var(--color-surface-soft)]" />
        <div className="h-4 w-72 animate-pulse rounded bg-[var(--color-surface-soft)]" />
      </div>
      <MediaGridSkeleton />
    </div>
  );
}
