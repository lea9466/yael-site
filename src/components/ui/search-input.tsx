import { Search } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type SearchInputProps = {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function SearchInput({
  placeholder = "חיפוש במערכת",
  disabled = false,
  className,
  "aria-label": ariaLabel = "חיפוש במערכת",
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute start-auto end-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]"
      />
      <input
        type="search"
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        className={cn(
          "h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] ps-4 pe-10 text-sm text-[var(--color-text)]",
          "placeholder:text-[var(--color-text-muted)]",
          "hover:border-[var(--color-border-strong)]",
          "focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/15",
          "disabled:cursor-not-allowed disabled:opacity-70"
        )}
      />
      {disabled ? (
        <span className="sr-only">חיפוש יתווסף בעתיד</span>
      ) : null}
    </div>
  );
}
