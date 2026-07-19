import { PostCard } from "@/components/homepage/post-card";
import { PublicSectionHeader } from "@/components/homepage/public-section-header";
import { Container } from "@/components/public/layout/container";
import { Section } from "@/components/public/layout/section";
import type { PublicPostSummary } from "@/lib/public/types";

type RecentPostsSectionProps = {
  posts: PublicPostSummary[];
};

export function RecentPostsSection({ posts }: RecentPostsSectionProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <Section tone="soft" ariaLabelledBy="homepage-posts-title">
      <Container className="space-y-10">
        <PublicSectionHeader
          eyebrow="תוכן"
          title="פוסטים אחרונים"
          description="תובנות, השראה וכלים מעשיים לחיים מאוזנים יותר."
          actionLabel="כל הפוסטים"
          actionHref="/articles"
          titleId="homepage-posts-title"
        />
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
