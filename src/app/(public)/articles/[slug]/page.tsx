import { permanentRedirect } from "next/navigation";

import { buildPostPath } from "@/lib/public/blog-paths";
import { normalizeRouteSlug } from "@/lib/slug/normalize-route-slug";

type LegacyArticlePageProps = {
  params: Promise<{ slug: string }>;
};

/** Legacy path — keep for bookmarks and external links. */
export default async function LegacyArticleRedirectPage({
  params,
}: LegacyArticlePageProps) {
  const { slug: rawSlug } = await params;
  const slug = normalizeRouteSlug(rawSlug);
  permanentRedirect(buildPostPath(slug));
}
