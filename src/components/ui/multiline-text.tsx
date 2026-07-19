import { cn } from "@/lib/utils/cn";

type MultilineTextProps = {
  children: string;
  className?: string;
  as?: "p" | "span" | "div";
};

export function MultilineText({
  children,
  className,
  as: Component = "span",
}: MultilineTextProps) {
  return (
    <Component className={cn("whitespace-pre-line", className)}>
      {children}
    </Component>
  );
}
