import { cn } from "@/lib/utils/cn";

type ContactMessageContentProps = {
  message: string;
  variant?: "full" | "excerpt";
  className?: string;
};

export function ContactMessageContent({
  message,
  variant = "full",
  className,
}: ContactMessageContentProps) {
  const displayText =
    message.length > 0
      ? message
      : variant === "full"
        ? "אין תוכן להודעה."
        : "";

  return (
    <p
      className={cn(
        "whitespace-pre-line text-base leading-[var(--line-height-relaxed)] text-[var(--color-text)]",
        variant === "excerpt" && "text-sm text-[var(--color-text-muted)]",
        variant === "full" && "text-lg",
        className
      )}
    >
      {displayText}
    </p>
  );
}
