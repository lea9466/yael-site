import { cn } from "@/lib/utils/cn";

type AdminFormShellProps = {
  children: React.ReactNode;
  width?: "standard" | "wide";
  withActionBar?: boolean;
};

export function AdminFormShell({
  children,
  width = "standard",
  withActionBar = false,
}: AdminFormShellProps) {
  return (
    <div
      className={cn(
        "admin-form-shell me-auto w-full",
        width === "wide" ? "max-w-[1600px]" : "max-w-[1200px]",
        withActionBar &&
          "pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(6rem+env(safe-area-inset-bottom,0px))]"
      )}
    >
      {children}
    </div>
  );
}
