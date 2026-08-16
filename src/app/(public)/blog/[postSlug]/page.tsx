import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleBreadcrumbJsonLd } from "@/components/articles/public/article-breadcrumb-json-ld";
import { ArticleJsonLd } from "@/components/articles/public/article-json-ld";
import { RelatedPosts } from "@/components/articles/public/related-posts";
import { ArticlePublicView } from "@/components/articles/article-public-view";
import { ContactCtaSection } from "@/components/homepage/sections/contact-cta-section";
import { getDefaultHomepageData } from "@/lib/homepage/defaults";
import {
  getPublishedPostBySlug,
  getRelatedPosts,
} from "@/lib/public/blog-detail";
import { buildPostPath } from "@/lib/public/blog-paths";
import {
  getHomepageContent,
  getWebsiteSettings,
} from "@/lib/public/queries";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { shortenForSeoDescription } from "@/lib/seo/resolve";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";

/** Avoid Next.js cache-tag header crash on non-ASCII (Hebrew) slugs. */
export const dynamic = "force-dynamic";

type PostDetailPageProps = {
  params: Promise<{ postSlug: string }>;
};

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { postSlug: rawPostSlug } = await params;
  const postSlug = normalizeRouteSlug(rawPostSlug);
  const [settings, article] = await Promise.all([
    getWebsiteSettings(),
    getPublishedPostBySlug(postSlug),
  ]);

  if (!article) {
    return buildSiteMetadata(settings, {
      path: buildPostPath(postSlug),
      title: "הפוסט לא נמצא",
      noIndex: true,
    });
  }

  const title = article.seo.title.trim() || article.title;
  const description =
    article.seo.description.trim() ||
    shortenForSeoDescription(article.body);
  const ogImage =
    article.ogUrl ?? article.coverUrl ?? settings.ogImage?.url ?? null;
  const ogImageAlt = article.ogAlt ?? article.coverAlt ?? article.title;

  const metadata = buildSiteMetadata(settings, {
    path: buildPostPath(article.slug),
    title,
    description,
    ogImage,
    ogImageAlt,
    ogType: "article",
  });

  const customCanonical = article.seo.canonical_url?.trim();

  if (customCanonical) {
    metadata.alternates = {
      ...metadata.alternates,
      canonical: customCanonical,
    };
  }

  return metadata;
}

export default async function PublicPostDetailPage({
  params,
}: PostDetailPageProps) {
  const { postSlug: rawPostSlug } = await params;
  const postSlug = normalizeRouteSlug(rawPostSlug);
  const article = await getPublishedPostBySlug(postSlug);

  if (!article) {
    notFound();
  }

  const [settings, homepageContent, relatedPosts] = await Promise.all([
    getWebsiteSettings(),
    getHomepageContent(),
    getRelatedPosts({
      articleId: article.id,
      limit: 3,
    }),
  ]);

  const homepage = homepageContent ?? getDefaultHomepageData();

  return (
    <>
      <ArticleJsonLd
        article={article}
        authorName={settings.businessProfile.business_name}
      />
      <ArticleBreadcrumbJsonLd postTitle={article.title} postSlug={article.slug} />

      <div className="post-page">
        <div className="post-page__main">
          <ArticlePublicView article={article} mode="public" />
        </div>

        <RelatedPosts posts={relatedPosts} />
        <ContactCtaSection
          content={homepage.contact_cta}
          settings={settings}
        />
      </div>
    </>
  );
}
