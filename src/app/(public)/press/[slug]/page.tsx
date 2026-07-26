import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PressPublicDetailView } from "@/components/press/public/press-public-detail";
import {
  fetchPublishedPressArticleBySlug,
  fetchPublishedPressSlugs,
} from "@/lib/press/queries";
import { getWebsiteSettings } from "@/lib/public/queries";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { shortenForSeoDescription } from "@/lib/seo/resolve";

type PressDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const items = await fetchPublishedPressSlugs();

  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PressDetailPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeRouteSlug(rawSlug);
  const [settings, article] = await Promise.all([
    getWebsiteSettings(),
    fetchPublishedPressArticleBySlug(slug),
  ]);

  if (!article) {
    return buildSiteMetadata(settings, {
      path: `/press/${slug}`,
      title: "כתבה",
      description: "כתבה מהעיתונות",
    });
  }

  const description =
    article.seo_description ||
    article.excerpt ||
    shortenForSeoDescription(
      `${article.publication_name} — ${article.title}`
    );

  return buildSiteMetadata(settings, {
    path: `/press/${article.slug}`,
    title: article.seo_title || article.title,
    description,
  });
}

export default async function PublicPressDetailPage({
  params,
}: PressDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeRouteSlug(rawSlug);
  const article = await fetchPublishedPressArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return <PressPublicDetailView article={article} />;
}
