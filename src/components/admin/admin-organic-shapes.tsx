import type { AdminModuleId } from "@/lib/admin/module-themes";
import { getModuleTheme } from "@/lib/admin/module-themes";
import { cn } from "@/lib/utils/cn";

type AdminOrganicBackdropProps = {
  module?: AdminModuleId;
  className?: string;
};

export function AdminOrganicBackdrop({
  module = "dashboard",
  className,
}: AdminOrganicBackdropProps) {
  const theme = getModuleTheme(module);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div
        className="admin-organic-blob absolute -top-16 end-0 size-56 rounded-[var(--radius-full)] opacity-70 blur-2xl"
        style={{ background: theme.gradient }}
      />
      <div
        className="admin-organic-blob absolute -bottom-20 start-0 size-48 rounded-[var(--radius-full)] opacity-50 blur-2xl"
        style={{
          background:
            "linear-gradient(135deg, var(--color-light-sage-soft), var(--color-cream))",
        }}
      />
      <div
        className="admin-organic-blob absolute top-1/2 start-1/3 size-32 rounded-[var(--radius-full)] opacity-30 blur-xl"
        style={{ background: theme.accentSoft }}
      />
    </div>
  );
}
