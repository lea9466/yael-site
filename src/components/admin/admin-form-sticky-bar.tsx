import { cn } from "@/lib/utils/cn";

type AdminFormStickyBarProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminFormStickyBar({
  children,
  className,
}: AdminFormStickyBarProps) {
  return (
    <div
      className={cn(
        "admin-form-sticky-bar sticky top-0 z-[var(--z-sticky)] -mx-4 border-b border-[var(--color-border)]/60 bg-[var(--color-form-surface)]/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}
