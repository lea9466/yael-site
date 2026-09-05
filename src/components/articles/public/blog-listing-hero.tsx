import { PUBLIC_PAGE_SEO } from "@/lib/seo/public-page-copy";
import { cn } from "@/lib/utils/cn";

type BlogListingHeroProps = {
  className?: string;
};

export function BlogListingHero({ className }: BlogListingHeroProps) {
  return (
    <header className={cn("recipes-listing-hero", className)}>
      <p className="recipes-listing-hero__eyebrow">
        {PUBLIC_PAGE_SEO.blog.eyebrow}
      </p>

      <h1 id="blog-page-title" className="recipes-listing-hero__title">
        {PUBLIC_PAGE_SEO.blog.heading}
      </h1>

      <p className="recipes-listing-hero__description">
        {PUBLIC_PAGE_SEO.blog.intro}
      </p>
    </header>
  );
}
