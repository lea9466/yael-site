import { cn } from "@/lib/utils/cn";

type SectionHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({
  title,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <h2 className="text-section-title">{title}</h2>
      {description ? <p className="text-muted">{description}</p> : null}
    </div>
  );
}
