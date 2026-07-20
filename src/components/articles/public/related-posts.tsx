import { PostCard } from "@/components/homepage/post-card";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import { buildBlogPath } from "@/lib/public/blog-paths";
import type { PublicPostSummary } from "@/lib/public/types";
import { cn } from "@/lib/utils/cn";

type RelatedPostsProps = {
  posts: PublicPostSummary[];
  className?: string;
};

export function RelatedPosts({ posts, className }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-posts-title"
      className={cn("related-recipes", className)}
    >
      <PublicSectionHeader
        className="related-recipes__header"
        titleId="related-posts-title"
        title="פוסטים נוספים"
        actionLabel="לכל הפוסטים"
        actionHref={buildBlogPath()}
      />

      <ul
        className={cn(
          "related-recipes__grid",
          `related-recipes__grid--count-${posts.length}`
        )}
      >
        {posts.map((post) => (
          <li key={post.id} className="related-recipes__item">
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </section>
  );
}
