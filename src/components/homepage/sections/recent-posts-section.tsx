import { PostCard } from "@/components/homepage/post-card";
import { HomepageReveal } from "@/components/homepage/homepage-reveal";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import { orderHomepagePosts } from "@/lib/homepage/post-card-display";
import type { PublicPostSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type RecentPostsSectionProps = {
  posts: PublicPostSummary[];
};

export function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  if (posts.length === 0) {
    return null;
  }

  const orderedPosts = orderHomepagePosts(posts);

  return (
    <section
      aria-labelledby="homepage-posts-title"
      className="posts-section"
    >
      <div className="posts-section__inner">
        <HomepageReveal>
          <PublicSectionHeader
            className="posts-section__header"
            titleId="homepage-posts-title"
            eyebrow="תוכן"
            title="פוסטים אחרונים"
            description="תובנות, השראה וכלים מעשיים לחיים מאוזנים יותר."
            actionLabel="לכל המאמרים"
            actionHref="/articles"
          />
        </HomepageReveal>

        <ul
          className={cn(
            "posts-section__grid",
            `posts-section__grid--count-${orderedPosts.length}`,
          )}
        >
          {orderedPosts.map((post, index) => (
            <li key={post.id} className="posts-section__item">
              <HomepageReveal delayMs={80 + index * 80} className="h-full">
                <PostCard post={post} />
              </HomepageReveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
