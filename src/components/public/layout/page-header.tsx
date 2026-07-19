import { cn } from "@/lib/utils/cn";

import { Container } from "@/components/public/layout/container";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  className?: string;
  children?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  className,
  children,
}: PageHeaderProps) {
  return (
    <Container
      as="header"
      className={cn("space-y-4 pb-[var(--spacing-xl)] pt-[var(--spacing-lg)]", className)}
    >
      {eyebrow ? (
        <p className="text-caption font-medium tracking-wide text-[var(--color-secondary)]">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-3">
        <h1 className="text-page-title max-w-3xl">{title}</h1>
        {description ? (
          <p className="text-muted max-w-2xl text-base sm:text-lg">{description}</p>
        ) : null}
      </div>
      {children}
    </Container>
  );
}
