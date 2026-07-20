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
      className={cn("posts-section related-posts", className)}
    >
      <div className="posts-section__inner">
        <PublicSectionHeader
          className="posts-section__header"
          titleId="related-posts-title"
          title="פוסטים נוספים"
          actionLabel="לכל הפוסטים"
          actionHref={buildBlogPath()}
        />

        <ul
          className={cn(
            "posts-section__grid",
            `posts-section__grid--count-${posts.length}`
          )}
        >
          {posts.map((post) => (
            <li key={post.id} className="posts-section__item">
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
