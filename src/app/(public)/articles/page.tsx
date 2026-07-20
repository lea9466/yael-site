import { permanentRedirect } from "next/navigation";

import { buildBlogPath } from "@/lib/public/blog-paths";

/** Legacy path — keep for bookmarks and external links. */
export default function LegacyArticlesRedirectPage() {
  permanentRedirect(buildBlogPath());
}
