import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "surface-card flex flex-col items-start gap-2 p-[var(--spacing-lg)]",
        className
      )}
    >
      <h3 className="text-card-title">{title}</h3>
      <p className="text-muted">{description}</p>
    </div>
  );
}
