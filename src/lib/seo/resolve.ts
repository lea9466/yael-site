import { SITE_ORIGIN } from "@/lib/site/constants";
import type { ResolvedSeo, StoredSeo } from "@/lib/seo/types";

export function buildContentPath(pathSegment: string, slug: string): string {
  const base = pathSegment.startsWith("/") ? pathSegment : `/${pathSegment}`;

  return `${base}/${slug}`;
}

export function buildCanonicalUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;

  return `${SITE_ORIGIN}${normalized}`;
}

export function buildServiceCanonicalUrl(slug: string): string {
  return buildCanonicalUrl(buildContentPath("/services", slug));
}

export function buildRecipeCanonicalUrl(
  slug: string,
  categorySlug?: string | null
): string {
  if (categorySlug) {
    return buildCanonicalUrl(`/recipes/${categorySlug}/${slug}`);
  }

  return buildCanonicalUrl(buildContentPath("/recipes", slug));
}

import { normalizeMultilineTextForSeo } from "@/lib/text/multiline-text";

export function shortenForSeoDescription(text: string, maxLength = 160): string {
  const normalized = normalizeMultilineTextForSeo(text);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildAutoSeoTitle(title: string): string {
  return title.trim().slice(0, 70);
}

export function createEmptyStoredSeo(): StoredSeo {
  return {
    title: "",
    description: "",
    canonical_url: null,
  };
}

export function normalizeStoredSeoForSave(seo: {
  title: string;
  description: string;
}): StoredSeo {
  return {
    title: seo.title.trim(),
    description: seo.description.trim(),
    canonical_url: null,
  };
}

export function resolveStoredSeo(input: {
  title: string;
  description: string;
  slug: string;
  seo: StoredSeo;
  buildCanonical: (slug: string) => string;
}): ResolvedSeo {
  return {
    title: input.seo.title.trim() || input.title.trim(),
    description:
      input.seo.description.trim() ||
      shortenForSeoDescription(input.description),
    canonical_url: input.buildCanonical(input.slug),
  };
}

export function resolveServiceSeo(input: {
  title: string;
  short_description: string;
  slug: string;
  seo: StoredSeo;
}): ResolvedSeo {
  return resolveStoredSeo({
    title: input.title,
    description: input.short_description,
    slug: input.slug,
    seo: input.seo,
    buildCanonical: buildServiceCanonicalUrl,
  });
}

export function resolveRecipeSeo(input: {
  title: string;
  description: string;
  slug: string;
  seo: StoredSeo;
}): ResolvedSeo {
  return resolveStoredSeo({
    title: input.title,
    description: input.description,
    slug: input.slug,
    seo: input.seo,
    buildCanonical: buildRecipeCanonicalUrl,
  });
}

export function buildArticleCanonicalUrl(slug: string): string {
  return buildCanonicalUrl(buildContentPath("/blog", slug));
}

export function resolveArticleSeo(input: {
  title: string;
  body: string;
  slug: string;
  seo: StoredSeo;
}): ResolvedSeo {
  return resolveStoredSeo({
    title: input.title,
    description: input.body,
    slug: input.slug,
    seo: input.seo,
    buildCanonical: buildArticleCanonicalUrl,
  });
}
