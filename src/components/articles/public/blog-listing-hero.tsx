import type { PublicBlogCategory } from "@/lib/public/blog-listing";
import { PUBLIC_PAGE_SEO } from "@/lib/seo/public-page-copy";
import { cn } from "@/lib/utils/cn";

type BlogListingHeroProps = {
  category?: PublicBlogCategory | null;
  className?: string;
};

export function BlogListingHero({
  category,
  className,
}: BlogListingHeroProps) {
  const title = category ? category.name : PUBLIC_PAGE_SEO.blog.heading;
  const description = category ? null : PUBLIC_PAGE_SEO.blog.intro;

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
