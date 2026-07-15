import { cn } from "@/lib/utils/cn";

type TestimonialContentProps = {
  content: string;
  variant?: "full" | "excerpt";
  className?: string;
  quoted?: boolean;
};

export function TestimonialContent({
  content,
  variant = "full",
  className,
  quoted = false,
}: TestimonialContentProps) {
  const displayText =
    variant === "excerpt"
      ? content
      : content.length > 0
        ? content
        : "טקסט ההמלצה יופיע כאן.";

  return (
    <p
      className={cn(
        "whitespace-pre-line text-base leading-[var(--line-height-relaxed)] text-[var(--color-text)]",
        variant === "excerpt" &&
          "text-sm text-[var(--color-text-muted)]",
        className
      )}
    >
      {quoted ? (
        <>
          <span aria-hidden="true">&ldquo;</span>
          {displayText}
          <span aria-hidden="true">&rdquo;</span>
        </>
      ) : (
        displayText
      )}
    </p>
  );
}
