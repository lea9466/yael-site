import type { PublicBlogCategory } from "@/lib/public/blog-listing";
import { cn } from "@/lib/utils/cn";

type BlogListingHeroProps = {
  category?: PublicBlogCategory | null;
  className?: string;
};

export function BlogListingHero({
  category,
  className,
}: BlogListingHeroProps) {
  const title = category ? category.name : "פוסטים";
  const description = category
    ? null
    : "מאמרים, מדריכים וטיפים לתזונה ואורח חיים בריא.";

  return (
    <header className={cn("recipes-listing-hero", className)}>
      <h1 id="blog-page-title" className="recipes-listing-hero__title">
        {title}
      </h1>

      {description ? (
        <p className="recipes-listing-hero__description">{description}</p>
      ) : null}
    </header>
  );
}
