import { PostCard } from "@/components/homepage/post-card";
import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { SectionCTA } from "@/components/homepage/section-cta";
import { getPrimaryFeaturedPostId } from "@/lib/homepage/post-card-display";
import type { PublicPostSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type RecentPostsSectionProps = {
  posts: PublicPostSummary[];
};

export function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  if (posts.length === 0) {
    return null;
  }

  const primaryFeaturedId = getPrimaryFeaturedPostId(posts);

  return (
    <section
      aria-labelledby="homepage-posts-title"
      className="posts-section"
    >
      <div className="posts-section__inner">
        <HomepageReveal>
          <header className="posts-section__header">
            <p className="posts-section__eyebrow">תוכן</p>
            <h2 id="homepage-posts-title" className="posts-section__title">
              פוסטים אחרונים
            </h2>
            <p className="posts-section__description">
              תובנות, השראה וכלים מעשיים לחיים מאוזנים יותר.
            </p>
          </header>
        </HomepageReveal>

        <ul
          className={cn(
            "posts-section__grid",
            primaryFeaturedId && "posts-section__grid--has-featured"
          )}
        >
          {posts.map((post, index) => (
            <li
              key={post.id}
              className={cn(
                "posts-section__item",
                post.id === primaryFeaturedId && "posts-section__item--featured"
              )}
            >
              <HomepageReveal delayMs={80 + index * 90}>
                <PostCard
                  post={post}
                  featured={post.id === primaryFeaturedId}
                />
              </HomepageReveal>
            </li>
          ))}
        </ul>

        <HomepageReveal delayMs={160}>
          <div className="posts-section__footer">
            <SectionCTA label="כל המאמרים" href="/articles" variant="primary" />
          </div>
        </HomepageReveal>
      </div>
    </section>
  );
}
