import type { CSSProperties } from "react";

import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import {
  getApproachCardSurface,
  getApproachDesktopColumns,
  type ApproachCardSurface,
} from "@/lib/homepage/approach-card-display";
import { HOMEPAGE_APPROACH_POINTS } from "@/lib/homepage/approach-points";
import type { HomepageData } from "@/lib/validations/homepage-hero";
import { cn } from "@/lib/utils/cn";

type ApproachSectionProps = {
  content: HomepageData["approach"];
};

const surfaceClasses: Record<ApproachCardSurface, string> = {
  sage: "approach-card--sage",
  coral: "approach-card--coral",
  cream: "approach-card--cream",
  sky: "approach-card--sky",
};

export function ApproachSection({ content }: ApproachSectionProps) {
  const desktopColumns = getApproachDesktopColumns(HOMEPAGE_APPROACH_POINTS.length);
  const sectionStyle = {
    "--approach-desktop-columns": desktopColumns,
  } as CSSProperties;

  return (
    <section
      aria-labelledby="homepage-approach-title"
      className="approach-section"
      style={sectionStyle}
    >
      <div className="approach-section__inner">
        <HomepageReveal>
          <header className="approach-section__header">
            <h2 id="homepage-approach-title" className="approach-section__title">
              {content.title}
            </h2>
            <p className="approach-section__description">{content.text}</p>
          </header>
        </HomepageReveal>

        <ul className="approach-section__grid">
          {HOMEPAGE_APPROACH_POINTS.map((point, index) => {
            const Icon = point.icon;
            const surface = getApproachCardSurface(index);

            return (
              <li key={point.id} className="approach-section__item">
                <HomepageReveal delayMs={index * 100} className="h-full">
                  <article
                    className={cn("approach-card", surfaceClasses[surface])}
                  >
                    <div className="approach-card__icon" aria-hidden="true">
                      <Icon className="approach-card__icon-svg" strokeWidth={1.75} />
                    </div>
                    <h3 className="approach-card__title">{point.title}</h3>
                    <p className="approach-card__description">{point.description}</p>
                  </article>
                </HomepageReveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
