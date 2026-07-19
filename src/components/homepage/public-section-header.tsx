import { SectionViewAllLink } from "@/components/homepage/section-view-all-link";
import { cn } from "@/lib/utils/cn";

type PublicSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  titleId?: string;
};

export function PublicSectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  className,
  titleId,
}: PublicSectionHeaderProps) {
  const showAction = Boolean(actionLabel && actionHref);

  return (
    <header className={cn("public-section-header", className)}>
      <div className="public-section-header__copy">
        {eyebrow ? (
          <p className="public-section-header__eyebrow">{eyebrow}</p>
        ) : null}
        <h2 id={titleId} className="public-section-header__title">
          {title}
        </h2>
        {description ? (
          <p className="public-section-header__description">{description}</p>
        ) : null}
      </div>

      {showAction && actionLabel && actionHref ? (
        <div className="public-section-header__action">
          <SectionViewAllLink href={actionHref} label={actionLabel} />
        </div>
      ) : null}
    </header>
  );
}
