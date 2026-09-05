import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type FeelGoodBannerProps = {
  /** Where "נשמע טוב" points. */
  href: string;
};

export function FeelGoodBanner({ href }: FeelGoodBannerProps) {
  return (
    <section
      aria-labelledby="homepage-feel-good-title"
      className="feel-good-banner"
    >
      <div className="feel-good-banner__inner">
        <p id="homepage-feel-good-title" className="feel-good-banner__title">
          מרגישה טוב
        </p>
        <p className="feel-good-banner__text">
          תוכנית הדגל &ldquo;אוכלת בשפת הגוף&rdquo;, אימון אישי לאכילה מחוברת
        </p>
        <Link href={href} className="feel-good-banner__cta public-focus-ring">
          <span>נשמע טוב</span>
          <ArrowLeft aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}
