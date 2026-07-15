import { cn } from "@/lib/utils/cn";

type AdminFormShellProps = {
  children: React.ReactNode;
  width?: "standard" | "wide";
};

export function AdminFormShell({
  children,
  width = "standard",
}: AdminFormShellProps) {
  return (
    <div
      className={cn(
        "admin-form-shell me-auto w-full",
        width === "wide" ? "max-w-[1600px]" : "max-w-[1100px]"
      )}
    >
      {children}
    </div>
  );
}
