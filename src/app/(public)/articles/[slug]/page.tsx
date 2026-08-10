import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

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

type LegacyArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: LegacyArticlePageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeRouteSlug(rawSlug);
  const [settings, article] = await Promise.all([
    getWebsiteSettings(),
    getPublishedPostBySlug(slug),
  ]);

  if (!article) {
    return buildSiteMetadata(settings, {
      path: `/articles/${slug}`,
      title: "הפוסט לא נמצא",
      noIndex: true,
    });
  }

  if (article.category?.slug) {
    return buildSiteMetadata(settings, {
      path: buildPostPath(article.category.slug, article.slug),
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
    path: `/articles/${article.slug}`,
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

/** Legacy flat `/articles/{slug}` → nested `/blog/{category}/{slug}` for posts with categories, or direct render for posts without categories. */
export default async function LegacyArticleRedirectPage({
  params,
}: LegacyArticlePageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeRouteSlug(rawSlug);
  const article = await getPublishedPostBySlug(slug);

  if (!article) {
    notFound();
  }

  if (article.category?.slug) {
    permanentRedirect(buildPostPath(article.category.slug, article.slug));
  }

  const [settings, homepageContent, relatedPosts] = await Promise.all([
    getWebsiteSettings(),
    getHomepageContent(),
    getRelatedPosts({
      articleId: article.id,
      categoryId: article.category_id,
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
      <ArticleBreadcrumbJsonLd
        postTitle={article.title}
        postSlug={article.slug}
        category={article.category}
      />

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
