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
        "admin-form-sticky-bar sticky top-0 z-[var(--z-sticky)] -mx-5 border-b border-[var(--color-border)]/50 bg-[var(--color-background)]/90 px-5 py-4 backdrop-blur-md sm:-mx-10 sm:px-10 lg:-mx-12 lg:px-12",
        className
      )}
    >
      {children}
    </div>
  );
}
