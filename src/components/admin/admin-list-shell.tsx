import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type AdminListShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminListShell({ children, className }: AdminListShellProps) {
  return (
    <div className={cn("admin-list-shell mx-auto w-full max-w-[1400px] space-y-10", className)}>
      {children}
    </div>
  );
}

type AdminListFiltersProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminListFilters({ children, className }: AdminListFiltersProps) {
  return (
    <div
      className={cn(
        "admin-list-filters grid gap-5 lg:grid-cols-3 xl:grid-cols-6",
        className
      )}
    >
      {children}
    </div>
  );
}

type AdminListToolbarProps = {
  countLabel: string;
  children?: React.ReactNode;
  className?: string;
};

export function AdminListToolbar({
  countLabel,
  children,
  className,
}: AdminListToolbarProps) {
  return (
    <div
      className={cn(
        "admin-list-toolbar flex items-center justify-between gap-4",
        className
      )}
    >
      <p className="text-sm text-[var(--color-text-muted)]">{countLabel}</p>
      {children}
    </div>
  );
}

type AdminListPaginationProps = {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
};

export function AdminListPagination({
  page,
  totalPages,
  onPrevious,
  onNext,
  className,
}: AdminListPaginationProps) {
  return (
    <div
      className={cn(
        "admin-list-pagination flex items-center justify-between gap-4 pt-2",
        className
      )}
    >
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={onPrevious}
      >
        הקודם
      </Button>
      <p className="text-caption text-[var(--color-text-muted)]">
        עמוד {page} מתוך {totalPages}
      </p>
      <Button
        variant="outline"
        disabled={page >= totalPages}
        onClick={onNext}
      >
        הבא
      </Button>
    </div>
  );
}

type AdminListItemsProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminListItems({ children, className }: AdminListItemsProps) {
  return (
    <div className={cn("admin-list-items divide-y divide-[var(--color-border)]/60", className)}>
      {children}
    </div>
  );
}
